import { useState } from 'react';
import { useAuth } from '../lib/AuthContext.jsx';

const B = {
  orange: "#F7941D", green: "#17A578", grey: "#616262", dark: "#333333",
  secondary: "#484848", lightBg: "#F5F5F5", white: "#FFFFFF",
  orangeT15: "#FFF4E6", greenT15: "#E5F7F1",
};
const FONT_UI = "'Montserrat', sans-serif";

export default function AuthScreen() {
  const { signIn, signUp, isNewDoctor, saveDoctorProfile, user } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Doctor onboarding form (shown after first login when no profile exists)
  const [doctorForm, setDoctorForm] = useState({
    name: '', specialty: '', degrees: '', mci: '',
    clinic: '', address: '', phone: '',
  });
  const [onboardError, setOnboardError] = useState('');
  const [onboarding, setOnboarding] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (mode === 'signup') {
        if (!phone.trim()) { setError('Phone number is required'); setSubmitting(false); return; }
        const { error } = await signUp(email, password, phone);
        if (error) { setError(error); setSubmitting(false); return; }
        setSignupSuccess(true);
      } else {
        const { error } = await signIn(email, password);
        if (error) { setError(error); setSubmitting(false); return; }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOnboard = async (e) => {
    e.preventDefault();
    setOnboardError('');
    if (!doctorForm.name.trim()) { setOnboardError('Doctor name is required'); return; }
    if (!doctorForm.phone.trim()) { setOnboardError('Phone number is required'); return; }

    setOnboarding(true);
    const { error } = await saveDoctorProfile(doctorForm);
    if (error) { setOnboardError(error); setOnboarding(false); return; }
    // Profile saved — AuthContext will update and app will load
  };

  // ── Doctor onboarding screen ──
  if (isNewDoctor) {
    return (
      <div style={styles.page}>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <div style={{ ...styles.card, maxWidth: 500 }}>
          <div style={styles.logoRow}>
            <span style={{ fontSize: 18, fontWeight: 700 }}>
              <span style={{ color: B.orange }}>Orange</span>Script
            </span>
          </div>
          <h2 style={styles.title}>Welcome! Set up your profile</h2>
          <p style={{ fontSize: 12, color: B.grey, marginBottom: 20, textAlign: 'center' }}>
            This information appears on your prescriptions.
          </p>

          <form onSubmit={handleOnboard} style={styles.form}>
            {[
              { key: 'name', label: 'Doctor Name *', placeholder: 'Dr. Full Name' },
              { key: 'specialty', label: 'Specialty', placeholder: 'e.g. General Medicine' },
              { key: 'degrees', label: 'Degrees / Qualifications', placeholder: 'e.g. MBBS, MD (Internal Medicine)' },
              { key: 'mci', label: 'Registration No.', placeholder: 'e.g. KA-45892' },
              { key: 'clinic', label: 'Clinic Name', placeholder: 'e.g. Sharma Wellness Clinic' },
              { key: 'phone', label: 'Clinic Phone *', placeholder: '+91 80 2664 5500' },
            ].map(f => (
              <div key={f.key} style={styles.field}>
                <label style={styles.label}>{f.label}</label>
                <input
                  value={doctorForm[f.key]}
                  onChange={e => setDoctorForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={styles.input}
                />
              </div>
            ))}
            <div style={styles.field}>
              <label style={styles.label}>Clinic Address</label>
              <textarea
                value={doctorForm.address}
                onChange={e => setDoctorForm(p => ({ ...p, address: e.target.value }))}
                placeholder="Full address (use Enter for new lines)"
                rows={2}
                style={{ ...styles.input, resize: 'vertical', minHeight: 48 }}
              />
            </div>

            {onboardError && <div style={styles.error}>{onboardError}</div>}

            <button type="submit" disabled={onboarding} style={{ ...styles.btn, ...styles.btnPrimary, marginTop: 8 }}>
              {onboarding ? 'Saving...' : 'Save & Start Prescribing'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Signup success ──
  if (signupSuccess) {
    return (
      <div style={styles.page}>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <div style={styles.card}>
          <div style={styles.logoRow}>
            <span style={{ fontSize: 18, fontWeight: 700 }}>
              <span style={{ color: B.orange }}>Orange</span>Script
            </span>
          </div>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✉️</div>
            <h2 style={{ ...styles.title, marginBottom: 8 }}>Check your email</h2>
            <p style={{ fontSize: 13, color: B.grey, lineHeight: 1.6 }}>
              We've sent a confirmation link to <strong>{email}</strong>.<br />
              Click it to activate your account, then come back and log in.
            </p>
            <button onClick={() => { setSignupSuccess(false); setMode('login'); }} style={{ ...styles.btn, ...styles.btnSecondary, marginTop: 20 }}>
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Login / Signup form ──
  return (
    <div style={styles.page}>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={styles.card}>
        {/* Brand */}
        <div style={styles.logoRow}>
          <span style={{ fontSize: 22, fontWeight: 700 }}>
            <span style={{ color: B.orange }}>Orange</span>Script
          </span>
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: B.grey, marginBottom: 24 }}>
          Smart Rx Pad for Indian Clinics
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: 20, borderBottom: '1px solid #eee' }}>
          {['login', 'signup'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1, padding: '10px 0', border: 'none', background: 'transparent',
                fontSize: 12, fontWeight: 700, fontFamily: FONT_UI, cursor: 'pointer',
                textTransform: 'uppercase', letterSpacing: 0.8,
                color: mode === m ? B.orange : B.grey,
                borderBottom: mode === m ? `2px solid ${B.orange}` : '2px solid transparent',
              }}>
              {m === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleAuth} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="doctor@clinic.com" style={styles.input} />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'Min 6 characters' : 'Your password'}
              minLength={mode === 'signup' ? 6 : undefined} style={styles.input} />
          </div>

          {mode === 'signup' && (
            <div style={styles.field}>
              <label style={styles.label}>Phone Number</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210" style={styles.input} />
            </div>
          )}

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" disabled={submitting} style={{ ...styles.btn, ...styles.btnPrimary }}>
            {submitting ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: B.grey }}>
          {mode === 'login'
            ? <span>Don't have an account? <button onClick={() => setMode('signup')} style={styles.link}>Sign up</button></span>
            : <span>Already have an account? <button onClick={() => setMode('login')} style={styles.link}>Log in</button></span>
          }
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'fixed', bottom: 16, textAlign: 'center', width: '100%', fontSize: 10, color: '#aaa' }}>
        Powered by <span style={{ color: B.orange, fontWeight: 600 }}>Orange Health Labs</span>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#ede9e0', fontFamily: FONT_UI, padding: 20,
    overflowY: 'auto',
  },
  card: {
    background: B.white, borderRadius: 12, padding: '32px 36px', maxWidth: 380,
    width: '100%', boxShadow: '0 4px 30px rgba(0,0,0,0.08)',
  },
  logoRow: { textAlign: 'center', marginBottom: 6 },
  title: { fontSize: 16, fontWeight: 700, color: B.dark, textAlign: 'center', marginBottom: 4 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 10.5, fontWeight: 600, color: B.grey, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    padding: '9px 12px', border: '1.5px solid #e0e0e0', borderRadius: 6,
    fontSize: 13, fontFamily: FONT_UI, outline: 'none', boxSizing: 'border-box', width: '100%',
  },
  btn: {
    padding: '10px 20px', borderRadius: 6, fontSize: 13, fontWeight: 600,
    fontFamily: FONT_UI, cursor: 'pointer', border: 'none', width: '100%',
  },
  btnPrimary: { background: B.orange, color: B.white },
  btnSecondary: { background: 'transparent', border: `1.5px solid ${B.orange}`, color: B.orange },
  error: {
    background: '#FFF0F0', border: '1px solid #FFD0D0', borderRadius: 6,
    padding: '8px 12px', fontSize: 12, color: '#c0392b',
  },
  link: {
    background: 'none', border: 'none', color: B.orange, fontWeight: 600,
    cursor: 'pointer', fontFamily: FONT_UI, fontSize: 11, textDecoration: 'underline',
  },
};
