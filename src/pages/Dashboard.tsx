import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Cpu, Activity, Zap, Network, CheckCircle, Flame, Edit2, Sparkles, User, X } from 'lucide-react';
import { Link } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { RouteGuard } from '@/components/RouteGuard';
import { TopNav } from '@/components/TopNav';

interface SessionRecord {
  id: string;
  room_id: string;
  started_at: string;
  ended_at: string | null;
  room_name: string;
}

interface Stats {
  totalSessions: number;
  totalMinutes: number;
  totalMessages: number;
  roomsJoined: number;
}

function formatDuration(seconds: number) {
  if (seconds < 60) return '< 1m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

type ColorTheme = 'indigo' | 'emerald' | 'amber' | 'rose';

const themeStyles = {
  indigo: { bg: 'rgba(99, 102, 241, 0.12)', color: '#4f46e5', flare: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.3)' },
  emerald: { bg: 'rgba(16, 185, 129, 0.12)', color: '#059669', flare: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' },
  amber: { bg: 'rgba(245, 158, 11, 0.12)', color: '#d97706', flare: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' },
  rose: { bg: 'rgba(244, 63, 94, 0.12)', color: '#e11d48', flare: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.3)' }
};

function StatCard({ icon: Icon, label, value, theme = 'indigo' }: { icon: typeof Cpu; label: string; value: string; theme?: ColorTheme }) {
  const [hovered, setHovered] = useState(false);
  const t = themeStyles[theme];
  
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 24,
        padding: 24,
        display: 'flex', flexDirection: 'column', gap: 16,
        fontFamily: "'Manrope', sans-serif",
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${hovered ? t.border : 'rgba(255, 255, 255, 0.5)'}`,
        boxShadow: hovered ? `0 12px 30px ${t.flare}` : '0 4px 15px rgba(0, 0, 0, 0.03)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}>
      {/* Colorful background flare */}
      <div style={{
        position: 'absolute', top: -50, right: -50, width: 120, height: 120,
        background: t.flare, filter: 'blur(40px)', borderRadius: '50%',
        opacity: hovered ? 1 : 0.5,
        transition: 'opacity 0.4s ease'
      }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: t.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.3s ease',
          transform: hovered ? 'scale(1.05)' : 'scale(1)'
        }}>
          <Icon size={20} style={{ color: t.color }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#6b7280' }}>
          {label}
        </span>
      </div>
      <div style={{ 
        fontSize: 36, fontWeight: 800, color: '#111827', 
        fontFamily: "'Manrope', sans-serif", fontVariantNumeric: 'tabular-nums',
        position: 'relative', zIndex: 10
      }}>
        {value}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalSessions: 0, totalMinutes: 0, totalMessages: 0, roomsJoined: 0 });
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user has an active room session
  const [activeRoom, setActiveRoom] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('sr_active_room');
    if (stored) {
      try { setActiveRoom(JSON.parse(stored)); } catch {}
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!user) return;

      const [membersRes, sessionsRes, messagesRes] = await Promise.all([
        supabase.from('room_members').select('room_id').eq('user_id', user.id),
        supabase.from('sessions').select('*, rooms(name)').eq('started_by', user.id).order('started_at', { ascending: false }).limit(1000),
        supabase.from('messages').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);

      const roomIds = membersRes.data?.map(m => m.room_id) || [];

      let totalMinutes = 0;
      const sessionRecords: SessionRecord[] = [];
      if (sessionsRes.data) {
        for (const s of sessionsRes.data) {
          const ended = s.ended_at ? new Date(s.ended_at) : new Date();
          const started = new Date(s.started_at);
          const mins = Math.floor((ended.getTime() - started.getTime()) / 60000);
          totalMinutes += mins;
          sessionRecords.push({
            id: s.id,
            room_id: s.room_id,
            started_at: s.started_at,
            ended_at: s.ended_at,
            room_name: (s.rooms as any)?.name || 'Unknown room',
          });
        }
      }

      setStats({
        totalSessions: sessionsRes.data?.length || 0,
        totalMinutes,
        totalMessages: messagesRes.count || 0,
        roomsJoined: roomIds.length,
      });
      // Only show the 25 most recent sessions in the list
      setSessions(sessionRecords.slice(0, 25));
      setLoading(false);
    };
    load();
  }, [user]);

  return (
    <RouteGuard>
      <div style={{ minHeight: '100vh', background: 'transparent', fontFamily: "'Manrope', sans-serif" }}>
        <TopNav />
        <div style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: `120px 32px 80px`,
        }}>
          <div>
            {/* Page header */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                {activeRoom && (
                  <Link href={`/rooms/${activeRoom.id}`} title="Back to room">
                    <button style={{ 
                      width: 40, height: 40, borderRadius: 12, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      cursor: 'pointer',
                      background: 'rgba(255, 255, 255, 0.8)',
                      border: '1px solid rgba(165, 180, 252, 0.4)',
                      color: '#4f46e5',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'}
                    >
                      <ArrowLeft size={18} />
                    </button>
                  </Link>
                )}
                <h1 style={{ 
                  fontSize: 42, fontWeight: 800, 
                  fontFamily: "'Manrope', sans-serif",
                  color: '#1e1b4b', letterSpacing: '-0.03em',
                  display: 'flex', alignItems: 'center', gap: 12
                }}>
                  Your Activity <Sparkles size={32} style={{ color: '#4f46e5', fill: 'rgba(79, 70, 229, 0.2)' }} />
                </h1>
              </div>
              <p style={{ fontSize: 16, color: '#6b7280', marginLeft: activeRoom ? 56 : 0, fontWeight: 500 }}>
                Track your progress, celebrate wins, and level up every day.
              </p>
            </div>

            {/* Stats grid */}
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24, marginBottom: 48 }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{ borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 16, background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(165,180,252,0.2)' }}>
                    <div className="sr-skeleton" style={{ width: '55%', height: 16, borderRadius: 8 }} />
                    <div className="sr-skeleton" style={{ width: '40%', height: 32, borderRadius: 12 }} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24,
                marginBottom: 64
              }}>
                <StatCard icon={Activity} label="Time spent" value={formatDuration(stats.totalMinutes * 60)} theme="indigo" />
                <StatCard icon={Cpu} label="Total sessions" value={stats.totalSessions.toString()} theme="emerald" />
                <StatCard icon={Zap} label="Messages sent" value={stats.totalMessages.toString()} theme="amber" />
                <StatCard icon={Network} label="Rooms joined" value={stats.roomsJoined.toString()} theme="rose" />
              </div>
            )}

            {/* Session history */}
            <div>
              <h2 style={{ 
                fontSize: 24, fontWeight: 700, color: '#1e1b4b', marginBottom: 24,
                fontFamily: "'Manrope', sans-serif"
              }}>
                Session history
              </h2>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{ borderRadius: 16, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.5)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div className="sr-skeleton" style={{ width: 140, height: 16, borderRadius: 8 }} />
                        <div className="sr-skeleton" style={{ width: 90, height: 12, borderRadius: 6 }} />
                      </div>
                      <div className="sr-skeleton" style={{ width: 60, height: 16, borderRadius: 8 }} />
                    </div>
                  ))}
                </div>
              ) : sessions.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: 48,
                  color: '#6366f1', fontSize: 16,
                  background: 'rgba(255, 255, 255, 0.65)',
                  border: '1px solid rgba(165, 180, 252, 0.3)',
                  borderRadius: 24,
                }}>
                  No sessions yet. Start a focus timer in any room to track your activity.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {sessions.map(s => {
                    const ended = s.ended_at ? new Date(s.ended_at) : new Date();
                    const duration = Math.floor((ended.getTime() - new Date(s.started_at).getTime()) / 60000);
                    return (
                      <div
                        key={s.id}
                        data-testid={`session-row-${s.id}`}
                        style={{
                          borderRadius: 16, padding: '20px 24px',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                          background: 'rgba(255, 255, 255, 0.65)',
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                          border: '1px solid rgba(165, 180, 252, 0.3)',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                          cursor: 'default',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.08)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                      >
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: '#1e1b4b', marginBottom: 4 }}>
                            {s.room_name}
                          </div>
                          <div style={{ fontSize: 13, color: '#818cf8', fontWeight: 500 }}>{formatDate(s.started_at)}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, fontFamily: "'Courier New', Courier, monospace", color: '#4f46e5' }}>
                            {formatDuration(duration * 60)}
                          </div>
                          {!s.ended_at && (
                            <div style={{ 
                              fontSize: 12, fontWeight: 700, padding: '4px 10px', 
                              borderRadius: 999, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
                              textTransform: 'uppercase', letterSpacing: '1px',
                            }}>
                              Live
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </RouteGuard>
  );
}
