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
  const [, setLocation] = useLocation();

  const handleSignOut = async () => {
    await signOut();
    setLocation('/login');
  };

  return (
    <nav style={{
      position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
      width: 'calc(100% - 48px)', maxWidth: '1200px',
      height: 64,
      background: 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(165, 180, 252, 0.3)',
      borderRadius: 999,
      display: 'flex', alignItems: 'center',
      padding: '0 24px',
      zIndex: 40,
      gap: 16,
      boxShadow: '0 8px 32px rgba(99, 102, 241, 0.08)',
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
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '0 16px', height: 40, borderRadius: 999,
            color: '#4f46e5', textDecoration: 'none',
            background: '#e0e7ff',
            fontWeight: 700, fontSize: 14,
            transition: 'all 0.2s ease',
            fontFamily: "'Manrope', sans-serif"
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#c7d2fe'}
          onMouseLeave={e => e.currentTarget.style.background = '#e0e7ff'}
          title="Stats"
        >
          <BarChart2 size={18} strokeWidth={2.5} />
          <span>Stats</span>
        </Link>

        <Link
          href="/profile"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '0 16px', height: 40, borderRadius: 999,
            color: '#059669', textDecoration: 'none',
            background: '#d1fae5',
            fontWeight: 700, fontSize: 14,
            transition: 'all 0.2s ease',
            fontFamily: "'Manrope', sans-serif"
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#a7f3d0'}
          onMouseLeave={e => e.currentTarget.style.background = '#d1fae5'}
          title="Profile"
        >
          <User size={18} strokeWidth={2.5} />
          <span>Profile</span>
        </Link>

        <button
          onClick={handleSignOut}
          data-testid="button-sign-out"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '0 16px', height: 40, borderRadius: 999,
            color: '#dc2626', border: 'none',
            background: '#fee2e2',
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: "'Manrope', sans-serif"
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
          onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
          title="Sign out"
        >
          <LogOut size={18} strokeWidth={2.5} />
          <span>Sign out</span>
        </button>
      </div>
    </nav>
  );
}
