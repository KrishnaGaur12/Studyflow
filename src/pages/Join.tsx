import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

/**
 * /join/:code — invite link handler.
 *
 * Flow:
 *   1. If auth still loading → wait.
 *   2. If user is NOT logged in → save pending invite code to sessionStorage, go to /login.
 *   3. If logged in → look up room by invite_code, add membership if missing, redirect to /rooms/:id.
 */

const PENDING_INVITE_KEY = 'sr_pending_invite';

export default function Join() {
  const { code } = useParams<{ code: string }>();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!code) {
      setError('No invite code provided.');
      return;
    }

    const inviteCode = code.toUpperCase();

    // Not logged in — stash the code, send to login
    if (!user) {
      sessionStorage.setItem(PENDING_INVITE_KEY, inviteCode);
      setLocation('/login');
      return;
    }

    // Prevent double-run
    if (joining) return;
    setJoining(true);

    let cancelled = false;

    const doJoin = async () => {
      try {
         // 1. Look up the room by invite code
        const { data: room, error: roomErr } = await supabase
          .from('rooms')
          .select('id, created_by, name')
          .eq('invite_code', inviteCode)
          .maybeSingle();

      if (cancelled) return;

      if (roomErr || !room) {
          setError("That invite link doesn't match any room. It may have been deleted or revoked.");
          return;
        }
        
        // 2. Add membership if not already a member
        const { data: existing } = await supabase
          .from('room_members')
          .select('id')
          .eq('room_id', room.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (cancelled) return;

        if (!existing) {
          const role = room.created_by === user.id ? 'admin' : 'member';
          const { error: joinErr } = await supabase.from('room_members').insert({
            room_id: room.id,
            user_id: user.id,
            role,
          });
          if (cancelled) return;
          if (joinErr && !joinErr.message.toLowerCase().includes('duplicate')) {
            setError(joinErr.message);
            return;
          }
          toast({ variant: 'success', title: `Joined "${room.name}"` });
        }

        // 3. Redirect to the room
        if (!cancelled) {
          setLocation(`/rooms/${room.id}`);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Something went wrong. Please try again.');
        }
      }
    };

    doJoin();

    return () => {
      cancelled = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  return (
    <div style={{
      minHeight: '100vh', background: 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: "'Manrope', sans-serif",
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 16, textAlign: 'center', maxWidth: 400, padding: 40,
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 24,
        border: '1px solid rgba(165, 180, 252, 0.3)',
        boxShadow: '0 10px 30px rgba(99, 102, 241, 0.08)',
      }}>
        {error ? (
          <>
            <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: 8 }} />
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e1b4b', fontFamily: "'Manrope', sans-serif" }}>
              Invite not valid
            </h2>
            <p style={{ fontSize: 15, color: '#4f46e5', lineHeight: 1.6, marginBottom: 16 }}>{error}</p>
            <button
              onClick={() => setLocation('/lobby')}
              style={{
                height: 48, padding: '0 32px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: '#ffffff',
                border: 'none', borderRadius: 12,
                fontSize: 15, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                transition: 'all 0.2s ease',
                fontFamily: "'Manrope', sans-serif",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(79, 70, 229, 0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(79, 70, 229, 0.3)'; }}
            >
              Go to dashboard
            </button>
          </>
        ) : (
          <>
            <Loader2 size={40} style={{ color: '#6366f1', animation: 'spin 0.8s linear infinite', marginBottom: 12 }} />
            <p style={{ fontSize: 16, color: '#4f46e5', fontWeight: 500 }}>Joining room…</p>
          </>
        )}
      </div>
    </div>
  );
}

export { PENDING_INVITE_KEY };
