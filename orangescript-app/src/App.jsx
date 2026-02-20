import { useAuth } from './lib/AuthContext.jsx';
import AuthScreen from './components/AuthScreen.jsx';
import OrangeScript from './OrangeScript.jsx';

export default function App() {
  const { session, doctor, loading, isNewDoctor } = useAuth();

  // Show loading while checking auth state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#ede9e0', fontFamily: "'Montserrat', sans-serif",
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            <span style={{ color: '#F7941D' }}>Orange</span>Script
          </div>
          <div style={{ fontSize: 12, color: '#616262' }}>Loading...</div>
        </div>
      </div>
    );
  }

  // Not logged in, or new doctor needing onboarding → show auth screen
  if (!session || isNewDoctor) {
    return <AuthScreen />;
  }

  // Logged in with profile → show the app, passing doctor from cloud
  return <OrangeScript cloudDoctor={doctor} />;
}
