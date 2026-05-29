import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { LogOut, User, BarChart2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface TopNavProps {
  roomName?: string;
  hostedBy?: string;
  onLeave?: () => void;
}

export function TopNav({ roomName, hostedBy, onLeave }: TopNavProps) {
  const { profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleSignOut = async () => {
    await signOut();
    setLocation('/login');
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: 72,
      background: 'rgba(255, 255, 255, 0.55)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(165, 180, 252, 0.2)',
      display: 'flex', alignItems: 'center',
      padding: '0 32px',
      zIndex: 40,
      gap: 16,
      boxShadow: '0 1px 12px rgba(99, 102, 241, 0.04)',
    }}>
      {/* Logo */}
      <Link href="/lobby" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
        <img src="/logo.png" alt="StudyFlow" style={{ height: 32, objectFit: 'contain', mixBlendMode: 'multiply' }} />
        <span style={{
          fontSize: 20, fontWeight: 700,
          fontFamily: "'Manrope', sans-serif",
          color: '#1e1b4b',
          letterSpacing: '-0.02em',
        }}>
          StudyFlow
        </span>
      </Link>

      {/* Center — room info */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        {roomName && (
          <div style={{
            textAlign: 'center',
            background: 'rgba(255,255,255,0.5)',
            padding: '6px 20px',
            borderRadius: 999,
            border: '1px solid rgba(165, 180, 252, 0.2)',
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1e1b4b' }}>
              {roomName}
            </div>
            {hostedBy && (
              <div style={{ fontSize: 11, color: '#6366f1', marginTop: 1 }}>
                Hosted by {hostedBy}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right cluster */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {onLeave && (
          <button
            onClick={onLeave}
            data-testid="button-leave-room"
            style={{
              background: 'rgba(220, 38, 38, 0.08)',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              borderRadius: 999,
              padding: '0 16px',
              height: 36,
              fontSize: 13,
              color: '#dc2626',
              cursor: 'pointer',
              fontWeight: 500,
              fontFamily: "'Manrope', sans-serif",
              transition: 'all 0.2s ease',
            }}
          >
            Leave room
          </button>
        )}

        <Link
          href="/dashboard"
          data-testid="link-dashboard"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 40, height: 40, borderRadius: 12,
            color: '#4338ca', textDecoration: 'none',
            background: 'rgba(79, 70, 229, 0.06)',
            border: '1px solid rgba(165, 180, 252, 0.15)',
            transition: 'all 0.2s ease',
          }}
          title="Dashboard"
        >
          <BarChart2 size={18} />
        </Link>

        {/* Avatar/menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            data-testid="button-user-menu"
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff',
              fontSize: 14, fontWeight: 700,
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {profile?.display_name?.charAt(0).toUpperCase() || <User size={16} />}
          </button>

          {menuOpen && (
            <>
              <div
                onClick={() => setMenuOpen(false)}
                style={{
                  position: 'fixed', inset: 0, zIndex: 60,
                }}
              />
              <div style={{
                position: 'absolute', top: 48, right: 0,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(165, 180, 252, 0.25)',
                borderRadius: 16,
                boxShadow: '0 12px 40px rgba(99, 102, 241, 0.12)',
                padding: '6px',
                minWidth: 200,
                zIndex: 70,
              }}>
                <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid rgba(165, 180, 252, 0.15)', marginBottom: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e1b4b' }}>{profile?.display_name}</div>
                </div>
                <button
                  onClick={handleSignOut}
                  data-testid="button-sign-out"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '10px 14px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    borderRadius: 10,
                    color: '#dc2626', fontSize: 14, fontWeight: 500,
                    fontFamily: "'Manrope', sans-serif",
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220, 38, 38, 0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
