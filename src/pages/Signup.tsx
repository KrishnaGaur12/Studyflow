import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { RouteGuard } from '@/components/RouteGuard';
import { PENDING_INVITE_KEY } from '@/pages/Join';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [hovered, setHovered] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMsg('Display name is required.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName.trim() } },
    });
    if (error) {
      setLoading(false);
      if (error.message.toLowerCase().includes('rate limit')) {
        setErrorMsg('Email rate limit reached. Please wait a few minutes and try again.');
      } else {
        setErrorMsg(error.message);
      }
      return;
    }
    if (data.user && !data.session) {
      setLoading(false);
      setInfoMsg('Check your inbox for a confirmation email and click the link to activate your account.');
      return;
    }
    if (data.user && data.session) {
      // Email confirmation disabled — logged in immediately
      await supabase.from('profiles').upsert({
        id: data.user.id,
        display_name: displayName.trim(),
      });
      toast({ variant: 'success', title: 'Account created', body: 'Welcome to StudyFlow!' });
      const pendingInvite = sessionStorage.getItem(PENDING_INVITE_KEY);
      if (pendingInvite) {
        sessionStorage.removeItem(PENDING_INVITE_KEY);
        setLocation(`/join/${pendingInvite}`);
      } else {
        setLocation('/lobby');
      }
    }
    setLoading(false);
  };

  return (
    <RouteGuard requireAuth={false}>
      <div style={{
        minHeight: '100vh', background: 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        fontFamily: "'Outfit', sans-serif",
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            justifyContent: 'center', marginBottom: 32,
          }}>
            <img src="/logo.png" alt="StudyFlow" style={{ height: 40, objectFit: 'contain', mixBlendMode: 'multiply' }} />
            <span style={{ fontSize: 26, fontWeight: 700, color: '#1e1b4b', fontFamily: "'Playfair Display', serif", letterSpacing: '-0.02em' }}>
              StudyFlow
            </span>
          </div>

          <div 
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              background: 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 24,
              padding: '40px 32px',
              border: '1px solid rgba(165, 180, 252, 0.3)',
              boxShadow: hovered ? '0 20px 40px rgba(79, 70, 229, 0.12)' : '0 10px 30px rgba(99, 102, 241, 0.08)',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            <h1 style={{
              fontSize: 28, fontWeight: 700,
              color: '#1e1b4b', marginBottom: 8,
              letterSpacing: '-0.02em',
              fontFamily: "'Playfair Display', serif",
              textAlign: 'center',
            }}>
              Create account
            </h1>
            <p style={{ fontSize: 15, color: '#4f46e5', marginBottom: 32, textAlign: 'center', fontWeight: 500 }}>
              Join StudyFlow and find your focus.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <button
                type="button"
                onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/lobby` } })}
                style={{
                  height: 48,
                  cursor: 'pointer',
                  borderRadius: 12,
                  fontSize: 15, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  background: '#fff',
                  border: '1px solid rgba(165, 180, 252, 0.4)',
                  color: '#1e1b4b',
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.05)',
                  transition: 'all 0.2s ease',
                  fontFamily: "'Outfit', sans-serif",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.1)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'none', e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.05)')}
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: 18, height: 18 }} />
                Continue with Google
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '8px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(165, 180, 252, 0.4))' }} />
                <span style={{ fontSize: 12, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}>Or</span>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg, transparent, rgba(165, 180, 252, 0.4))' }} />
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Field label="Display name">
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  required
                  placeholder="Maya"
                  data-testid="input-display-name"
                  style={fieldStyle}
                  onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(165, 180, 252, 0.4)'}
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  data-testid="input-email"
                  style={fieldStyle}
                  onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(165, 180, 252, 0.4)'}
                />
              </Field>

              <Field label="Password">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  data-testid="input-password"
                  style={fieldStyle}
                  onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(165, 180, 252, 0.4)'}
                />
              </Field>

              {errorMsg && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(254, 226, 226, 0.8)',
                  border: '1px solid rgba(248, 113, 113, 0.4)',
                  borderRadius: 12,
                  fontSize: 14, color: '#b91c1c', lineHeight: 1.5,
                }}>
                  {errorMsg}
                </div>
              )}

              {infoMsg && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(219, 234, 254, 0.8)',
                  border: '1px solid rgba(96, 165, 250, 0.4)',
                  borderRadius: 12,
                  fontSize: 14, color: '#1d4ed8', lineHeight: 1.5,
                }}>
                  {infoMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !displayName.trim() || !!infoMsg}
                data-testid="button-sign-up"
                style={{
                  height: 48, marginTop: 8,
                  cursor: loading || !displayName.trim() ? 'not-allowed' : 'pointer',
                  borderRadius: 12, border: 'none',
                  fontSize: 15, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                  transition: 'all 0.2s ease',
                  opacity: loading || !displayName.trim() ? 0.7 : 1,
                  fontFamily: "'Outfit', sans-serif",
                }}
                onMouseEnter={e => { if (!loading && displayName.trim()) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(79, 70, 229, 0.4)'; } }}
                onMouseLeave={e => { if (!loading && displayName.trim()) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(79, 70, 229, 0.3)'; } }}
              >
                {loading && <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} />}
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <p style={{ marginTop: 32, textAlign: 'center', fontSize: 14, color: '#6366f1' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ 
                color: '#4f46e5', textDecoration: 'none', fontWeight: 700,
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}

const fieldStyle: React.CSSProperties = {
  width: '100%', height: 48, padding: '0 16px',
  color: '#1e1b4b', fontSize: 15,
  background: 'rgba(255, 255, 255, 0.7)',
  border: '1px solid rgba(165, 180, 252, 0.4)',
  borderRadius: 12,
  outline: 'none', boxSizing: 'border-box',
  fontFamily: "'Outfit', sans-serif",
  transition: 'border-color 0.2s ease, background 0.2s ease',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '1px',
        color: '#4f46e5', marginBottom: 8,
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}
