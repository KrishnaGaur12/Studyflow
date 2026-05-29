import { useEffect, useState } from 'react';
import { Play, Square, Coffee, BookOpen, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';

interface ActiveSession {
  id: string;
  started_at: string;
  ended_at: string | null;
}

interface TimerProps {
  roomId: string;
  isAdmin: boolean;
  currentUserId: string;
  onStatusChange?: (status: 'studying' | 'break' | 'idle') => void;
  myStatus: 'studying' | 'break' | 'idle';
  onSessionStateChange?: (isActive: boolean) => void;
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const RING_SIZE = 340;
const RING_RADIUS = 150;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const POMODORO_DURATION = 25 * 60;

export function Timer({ roomId, isAdmin, currentUserId, onStatusChange, myStatus, onSessionStateChange }: TimerProps) {
  const { toast } = useToast();
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [hoveredStart, setHoveredStart] = useState(false);
  const [hoveredEnd, setHoveredEnd] = useState(false);
  const [hoveredToggle, setHoveredToggle] = useState(false);

  // Load current session
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('room_id', roomId)
        .is('ended_at', null)
        .maybeSingle();
      setSession(data || null);
      setLoading(false);
    };
    load();
  }, [roomId]);

  // Broadcast session state to parent
  useEffect(() => {
    onSessionStateChange?.(!!session);
  }, [session, onSessionStateChange]);

  // Subscribe to session changes
  useEffect(() => {
    const channel = supabase
      .channel(`session:${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions', filter: `room_id=eq.${roomId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const s = payload.new as ActiveSession;
            if (!s.ended_at) {
              setSession(s);
              toast({ variant: 'info', title: 'Session started', body: '25-minute Pomodoro.' });
            }
          } else if (payload.eventType === 'UPDATE') {
            const s = payload.new as ActiveSession;
            if (s.ended_at) {
              setSession(null);
              setElapsed(0);
              toast({ variant: 'info', title: 'Session ended' });
            }
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId, toast]);

  // Tick
  useEffect(() => {
    if (!session) return;
    const tick = () => {
      const e = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);
      setElapsed(e);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const startSession = async () => {
    setStarting(true);
    const { error } = await supabase.from('sessions').insert({
      room_id: roomId,
      started_by: currentUserId,
    });
    if (error) {
      toast({ variant: 'error', title: 'Could not start session', body: error.message });
    }
    setStarting(false);
  };

  const endSession = async () => {
    if (!session) return;
    setEnding(true);
    setShowEndConfirm(false);
    await supabase.from('sessions').update({ ended_at: new Date().toISOString() }).eq('id', session.id);
    setEnding(false);
  };

  const ringProgress = session ? Math.min(elapsed / POMODORO_DURATION, 1) : 0;
  const dashOffset = RING_CIRCUMFERENCE * (1 - ringProgress);

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 32,
      fontFamily: "'Manrope', sans-serif",
      padding: 32,
      background: 'rgba(255, 255, 255, 0.4)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: 24,
      border: '1px solid rgba(165, 180, 252, 0.2)',
    }}>
      {/* Eyebrow */}
      <div style={{
        textAlign: 'center', fontSize: 13, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '2px',
        color: '#6366f1',
      }}>
        {session ? 'Session in progress' : 'No session running'}
      </div>

      {/* Ring */}
      <div style={{ position: 'relative', width: RING_SIZE, height: RING_SIZE }}>
        {/* Ambient Glow */}
        {session && (
          <div style={{
            position: 'absolute', inset: -40,
            background: myStatus === 'break' 
              ? 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0) 60%)'
              : 'radial-gradient(circle, rgba(79, 70, 229, 0.2) 0%, rgba(79, 70, 229, 0) 60%)',
            filter: 'blur(30px)',
            zIndex: 0,
            animation: 'pulse-glow 4s ease-in-out infinite alternate',
            borderRadius: '50%',
          }} />
        )}
        <svg width={RING_SIZE} height={RING_SIZE} style={{ transform: 'rotate(-90deg)', position: 'relative', zIndex: 1 }}>
          <defs>
            <linearGradient id="timerGradientStudying" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
            <linearGradient id="timerGradientBreak" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {/* Background ring */}
          <circle
            cx={RING_SIZE / 2} cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(165, 180, 252, 0.3)"
            strokeWidth={4}
          />
          {/* Progress ring */}
          {session && (
            <circle
              cx={RING_SIZE / 2} cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              stroke={myStatus === 'break' ? "url(#timerGradientBreak)" : "url(#timerGradientStudying)"}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              filter="url(#glow)"
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
            />
          )}
        </svg>

        {/* Timer digits */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {loading ? (
            <Loader2 size={32} style={{ color: '#818cf8', animation: 'spin 0.8s linear infinite' }} />
          ) : (
            <>
              <div style={{
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: 64,
                fontWeight: 700,
                color: session ? '#1e1b4b' : '#818cf8',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {session ? formatTime(elapsed) : '—'}
              </div>
              {session && (
                <div style={{ fontSize: 14, fontWeight: 600, color: '#6366f1' }}>
                  Pomodoro · 25 min
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {!session && !loading && (
        <p style={{ fontSize: 14, color: '#6366f1', textAlign: 'center', maxWidth: 280, fontWeight: 500 }}>
          {isAdmin
            ? 'Start a Pomodoro session for everyone in the room.'
            : 'Only the host can start a session.'}
        </p>
      )}

      {/* Action row */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Own status toggle */}
        {session && (
          <button
            onClick={() => onStatusChange?.(myStatus === 'studying' ? 'break' : 'studying')}
            data-testid="button-toggle-status"
            style={{
              height: 48, padding: '0 24px',
              background: hoveredToggle ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)',
              border: '1px solid rgba(165, 180, 252, 0.4)',
              borderRadius: 12,
              color: myStatus === 'studying' ? '#4f46e5' : '#d97706',
              fontSize: 15, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
              transition: `all 0.2s ease`,
              fontFamily: "'Manrope', sans-serif",
            }}
            onMouseEnter={() => setHoveredToggle(true)}
            onMouseLeave={() => setHoveredToggle(false)}
          >
            {myStatus === 'studying'
              ? <><Coffee size={18} /> Take a break</>
              : <><BookOpen size={18} /> Resume studying</>
            }
          </button>
        )}

        {/* Admin controls */}
        {isAdmin && (
          <>
            {!session ? (
              <button
                onClick={startSession}
                disabled={starting}
                data-testid="button-start-session"
                style={{
                  height: 48, padding: '0 32px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: '#ffffff', border: 'none',
                  borderRadius: 12,
                  fontSize: 15, fontWeight: 600, cursor: starting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  opacity: starting ? 0.7 : 1,
                  boxShadow: hoveredStart ? '0 8px 24px rgba(79, 70, 229, 0.4)' : '0 4px 14px rgba(79, 70, 229, 0.3)',
                  transform: hoveredStart && !starting ? 'translateY(-2px)' : 'none',
                  transition: 'all 0.2s ease',
                  fontFamily: "'Manrope', sans-serif",
                }}
                onMouseEnter={() => setHoveredStart(true)}
                onMouseLeave={() => setHoveredStart(false)}
              >
                {starting
                  ? <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} />
                  : <Play size={18} fill="currentColor" />
                }
                Start session
              </button>
            ) : (
              <button
                onClick={() => setShowEndConfirm(true)}
                disabled={ending}
                data-testid="button-end-session"
                style={{
                  height: 48, padding: '0 24px',
                  background: hoveredEnd ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 12,
                  color: '#ef4444', fontSize: 15, fontWeight: 600,
                  cursor: ending ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  fontFamily: "'Manrope', sans-serif",
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={() => setHoveredEnd(true)}
                onMouseLeave={() => setHoveredEnd(false)}
              >
                {ending
                  ? <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} />
                  : <Square size={16} fill="currentColor" />
                }
                End session
              </button>
            )}
          </>
        )}
      </div>

      {/* End session confirm */}
      {showEndConfirm && (
        <>
          <div
            onClick={() => setShowEndConfirm(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(30, 27, 75, 0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 100 }}
          />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            borderRadius: 24, padding: 32,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid rgba(165, 180, 252, 0.4)',
            boxShadow: '0 24px 48px rgba(30, 27, 75, 0.15)',
            zIndex: 101, width: '90%', maxWidth: 400,
            fontFamily: "'Manrope', sans-serif",
          }}>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: '#1e1b4b', marginBottom: 12, fontFamily: "'Manrope', sans-serif" }}>
              End the session?
            </h3>
            <p style={{ fontSize: 15, color: '#4f46e5', marginBottom: 32, lineHeight: 1.6 }}>
              The timer will stop for everyone in the room. You can start a new one anytime.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={() => setShowEndConfirm(false)}
                style={{ height: 40, padding: '0 16px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#6366f1', fontSize: 14, fontWeight: 600, borderRadius: 8 }}
              >
                Cancel
              </button>
              <button
                onClick={endSession}
                data-testid="button-confirm-end-session"
                style={{
                  height: 40, padding: '0 20px',
                  background: '#ef4444', color: '#fff',
                  border: 'none', borderRadius: 8,
                  cursor: 'pointer', fontSize: 14, fontWeight: 600,
                }}
              >
                End session
              </button>
            </div>
          </div>
        </>
      )}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-glow { 0% { transform: scale(0.9); opacity: 0.7; } 100% { transform: scale(1.05); opacity: 1; } }
      `}</style>
    </div>
  );
}
