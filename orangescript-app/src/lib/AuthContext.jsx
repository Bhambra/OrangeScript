import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadDoctorProfile(session.user.id);
      else setLoading(false);
    });

    // Subscribe to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadDoctorProfile(session.user.id);
      else { setDoctor(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load doctor profile from Supabase
  const loadDoctorProfile = async (userId) => {
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No profile yet — new doctor, will fill in settings
        setDoctor(null);
      } else if (error) {
        console.error('Error loading doctor profile:', error);
        setDoctor(null);
      } else {
        setDoctor(data);
      }
    } catch (err) {
      console.error('Error loading doctor profile:', err);
    } finally {
      setProfileLoading(false);
      setLoading(false);
    }
  };

  // Save / update doctor profile
  const saveDoctorProfile = useCallback(async (profile) => {
    if (!session) return { error: 'Not authenticated' };

    const payload = {
      id: session.user.id,
      name: profile.name,
      specialty: profile.specialty || '',
      degrees: profile.degrees || '',
      mci: profile.mci || null,
      clinic: profile.clinic || '',
      address: profile.address || '',
      phone: profile.phone,
    };

    const { data, error } = await supabase
      .from('doctors')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Error saving doctor profile:', error);
      return { error: error.message };
    }

    setDoctor(data);
    return { data };
  }, [session]);

  // Sign up with email + password
  const signUp = useCallback(async (email, password, phone) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { phone }, // store phone in user metadata
      },
    });
    if (error) return { error: error.message };
    return { data };
  }, []);

  // Sign in with email + password
  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };
    return { data };
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setDoctor(null);
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    doctor,
    loading,
    profileLoading,
    isNewDoctor: session && !doctor,
    signUp,
    signIn,
    signOut,
    saveDoctorProfile,
    reloadProfile: () => session && loadDoctorProfile(session.user.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
