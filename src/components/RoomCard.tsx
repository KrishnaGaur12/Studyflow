import { useEffect, useState } from 'react';
import { Globe, Lock, Clock } from 'lucide-react';
import { supabase, type Room } from '@/lib/supabase';

interface RoomCardProps {
  room: Room;
  onClick: () => void;
}

interface MemberInfo {
  count: number;
  names: string[];
}

function formatElapsed(started_at: string) {
  const elapsed = Math.floor((Date.now() - new Date(started_at).getTime()) / 1000);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const typeIcons = { open: Globe, invite: Lock };
const typeLabels = { open: 'Open', invite: 'Invite-only' };

export function RoomCard({ room, onClick }: RoomCardProps) {
  const [memberInfo, setMemberInfo] = useState<MemberInfo>({ count: 0, names: [] });
  const [activeSession, setActiveSession] = useState<{ started_at: string } | null>(null);
  const [elapsed, setElapsed] = useState('');
  const [hovered, setHovered] = useState(false);
  const [hostName, setHostName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [membersRes, sessionRes, hostRes] = await Promise.all([
        supabase.from('room_members').select('user_id').eq('room_id', room.id),
        supabase.from('sessions').select('started_at').eq('room_id', room.id).is('ended_at', null).maybeSingle(),
        supabase.from('profiles').select('display_name').eq('id', room.created_by).single(),
      ]);

      const userIds = membersRes.data?.map((m: any) => m.user_id) || [];

      let names: string[] = [];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('display_name')
          .in('id', userIds);
        names = profiles?.map((p: any) => p.display_name).filter(Boolean) || [];
      }

      setMemberInfo({ count: userIds.length, names });
      if (sessionRes.data) setActiveSession(sessionRes.data);
      if (hostRes.data) setHostName(hostRes.data.display_name);
    };
    fetchData();
  }, [room.id, room.created_by]);

  useEffect(() => {
    if (!activeSession) return;
    const tick = () => setElapsed(formatElapsed(activeSession.started_at));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const TypeIcon = typeIcons[room.type];
  const displayNames = memberInfo.names.slice(0, 4);
  const extra = memberInfo.count - 4;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-testid={`card-room-${room.id}`}
      style={{
        padding: 32,
        borderRadius: 24,
        background: hovered ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: hovered ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid rgba(165, 180, 252, 0.3)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 20px 40px rgba(79, 70, 229, 0.12)' : '0 10px 30px rgba(99, 102, 241, 0.08)',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex', flexDirection: 'column', gap: 20,
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
            background: memberInfo.count > 0
              ? (activeSession ? '#10b981' : '#f59e0b')
              : '#9ca3af',
            boxShadow: memberInfo.count > 0 && activeSession ? '0 0 12px rgba(16, 185, 129, 0.6)' : 'none',
          }} />
          <span style={{ 
            fontSize: 22, fontWeight: 700, color: '#1e1b4b', 
            fontFamily: "'Manrope', sans-serif", letterSpacing: '-0.02em',
            lineHeight: 1.2 
          }}>
            {room.name}
          </span>
        </div>
        <div style={{ fontSize: 14, color: '#6366f1', display: 'flex', alignItems: 'center', gap: 6 }}>
          Hosted by <span style={{ fontWeight: 600 }}>{hostName || '…'}</span>
        </div>
      </div>

      <div style={{ fontSize: 15, color: '#4f46e5' }}>
        <span style={{ fontWeight: 700, fontSize: 18, color: '#1e1b4b' }}>{memberInfo.count}</span>
        <span> {memberInfo.count === 1 ? 'person' : 'people'} joined</span>
      </div>

      {memberInfo.count > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
          {displayNames.map((name, i) => (
            <div
              key={i}
              title={name}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                border: '3px solid #ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#4f46e5',
                marginLeft: i > 0 ? -12 : 0,
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              {name.charAt(0).toUpperCase()}
            </div>
          ))}
          {extra > 0 && (
            <div style={{ fontSize: 13, fontWeight: 600, color: '#818cf8', marginLeft: 12 }}>+{extra} more</div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto', paddingTop: 8 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 999,
          background: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(165, 180, 252, 0.3)',
          fontSize: 12, fontWeight: 600, color: '#6366f1',
          textTransform: 'uppercase', letterSpacing: '1px',
        }}>
          <TypeIcon size={12} />
          {typeLabels[room.type]}
        </div>
        {activeSession && (
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: 6, 
            fontSize: 13, fontWeight: 600, color: '#10b981', 
            fontFamily: "'Courier New', Courier, monospace",
            padding: '4px 12px', borderRadius: 999,
            background: 'rgba(16, 185, 129, 0.1)',
          }}>
            <Clock size={12} />
            {elapsed}
          </div>
        )}
      </div>
    </div>
  );
}
