import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { RouteGuard } from '@/components/RouteGuard';
import { PENDING_INVITE_KEY } from '@/pages/Join';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hovered, setHovered] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        setErrorMsg('Your email has not been confirmed yet. Check your inbox for a verification link.');
      } else if (error.message.toLowerCase().includes('invalid login credentials')) {
        setErrorMsg('Wrong email or password. Double-check and try again.');
      } else {
        setErrorMsg(error.message);
      }
      return;
    }
    const pendingInvite = sessionStorage.getItem(PENDING_INVITE_KEY);
    if (pendingInvite) {
      sessionStorage.removeItem(PENDING_INVITE_KEY);
      setLocation(`/join/${pendingInvite}`);
    } else {
      setLocation('/lobby');
    }
  };

  return (
    <RouteGuard requireAuth={false}>
      <div style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        fontFamily: "Manrope",
        background: 'transparent', // Vanta FOG will show through
      }}>

        {/* Top Header layer (Absolute) */}
        <header style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          padding: '40px 60px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          zIndex: 50
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.png" alt="StudyFlow Logo" style={{ height: '40px', objectFit: 'contain', mixBlendMode: 'multiply' }} />
            <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: "'Manrope', sans-serif", color: '#111827', letterSpacing: '-0.5px' }}>
              StudyFlow
            </div>
          </div>

          <div style={{ fontSize: '15px', color: '#6b7280', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Don't have an account?</span>
            <Link href="/signup" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              Sign up <ArrowRight size={16} />
            </Link>
          </div>
        </header>

        {/* Left Side: Hero Text */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 80px',
          paddingTop: '90px',
          zIndex: 10,
        }}>
          <h1 style={{
            fontSize: '4.5rem',
            fontWeight: 800,
            color: '#111827',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '50px'
          }}>
            Focus better,<br />
            <span style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #4f46e5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>together.</span>
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#4b5563',
            maxWidth: '480px',
            lineHeight: 1.5,
            fontWeight: 500,
          }}>
            Real-time study rooms, deep focus, and accountability that sticks.
          </p>

          <div style={{ marginTop: '40px' }}>
            <img
              src="/loginpagemodel.png"
              alt="3D Study Model"
              style={{ height: '320px', objectFit: 'contain', marginLeft: '-20px' }}
            />
          </div>

          <div style={{ marginTop: 'auto', paddingBottom: '60px' }}>
            <p style={{ fontSize: '1.1rem', color: '#6b7280', fontStyle: 'italic', position: 'relative', paddingLeft: 20 }}>
              <span style={{ position: 'absolute', left: -10, top: -10, fontSize: '2.5rem', color: '#a5b4fc', opacity: 0.5 }}>“</span>
              Great things happen when minds flow together.
            </p>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          padding: '0 40px',
        }}>
          <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              width: '100%',
              maxWidth: 480,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              borderRadius: 32,
              padding: '48px 40px',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: hovered ? '0 30px 60px rgba(99, 102, 241, 0.12)' : '0 20px 40px rgba(99, 102, 241, 0.08)',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h1 style={{
                fontSize: 32, fontWeight: 800,
                color: '#111827', marginBottom: 8,
                letterSpacing: '-0.03em',
              }}>
                Welcome back 👋
              </h1>
              <p style={{ fontSize: 16, color: '#6b7280', fontWeight: 500 }}>
                Log in to continue your flow.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
                  Email address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    style={inputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                    onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>
                    Password
                  </label>
                  <Link href="/forgot-password" style={{ fontSize: 13, color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    style={inputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                    onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div style={{
                  padding: '12px 16px',
                  background: '#fef2f2',
                  border: '1px solid #fca5a5',
                  borderRadius: 12,
                  fontSize: 14, color: '#b91c1c', lineHeight: 1.5,
                }}>
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  height: 52, marginTop: 12,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  borderRadius: 12, border: 'none',
                  fontSize: 16, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  color: '#ffffff',
                  boxShadow: '0 8px 20px rgba(99, 102, 241, 0.25)',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.8 : 1,
                  fontFamily: "'Manrope', sans-serif",
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(99, 102, 241, 0.35)'; } }}
                onMouseLeave={e => { if (!loading) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.25)'; } }}
              >
                {loading ? <Loader2 size={20} style={{ animation: 'spin 0.8s linear infinite' }} /> : 'Log in'}
                {!loading && <ArrowRight size={20} />}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '32px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
              <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600 }}>or continue with</span>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            </div>

            <div style={{ display: 'flex', gap: 16, width: '100%' }}>
              <button
                type="button"
                onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/lobby` } })}
                style={{
                  flex: 1,
                  height: 52,
                  cursor: 'pointer',
                  borderRadius: 12,
                  fontSize: 15, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  color: '#111827',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease',
                  fontFamily: "'Manrope', sans-serif",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb', e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff', e.currentTarget.style.transform = 'none')}
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: 20, height: 20 }} />
                Google
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('demo@studyflow.com');
                  setPassword('demo12345');
                }}
                style={{
                  flex: 1,
                  height: 52,
                  cursor: 'pointer',
                  borderRadius: 12,
                  fontSize: 15, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  color: '#111827',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease',
                  fontFamily: "'Manrope', sans-serif",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb', e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff', e.currentTarget.style.transform = 'none')}
              >
                Demo Account
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 40, color: '#6b7280' }}>
              <ShieldCheck size={18} style={{ color: '#8b5cf6' }} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Your data is private and secure.</span>
            </div>

          </div>
        </div>
      </div>
    </RouteGuard>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 48,
  padding: '0 48px', // space for icons
  color: '#111827', fontSize: 15, fontWeight: 500,
  background: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  outline: 'none', boxSizing: 'border-box',
  fontFamily: "'Manrope', sans-serif",
  transition: 'border-color 0.2s ease, background 0.2s ease',
};
