import { Crown, MoreHorizontal, UserX } from 'lucide-react';
import { useState } from 'react';

export type PresenceStatus = 'studying' | 'break' | 'idle' | 'offline';

export interface PresenceMember {
  user_id: string;
  display_name: string;
  role: 'admin' | 'member';
  status: PresenceStatus;
  joined_at?: string;
}

interface PresenceSidebarProps {
  members: PresenceMember[];
  currentUserId: string;
  isAdmin: boolean;
  onKick: (userId: string, name: string) => void;
}

function PresenceDot({ status, withGlow = false }: { status: PresenceStatus; withGlow?: boolean }) {
  const colorMap: Record<PresenceStatus, string> = {
    studying: '#10b981', // green
    break: '#f59e0b', // amber
    idle: '#9ca3af', // gray
    offline: '#d1d5db',
  };
  const isOffline = status === 'offline';
  return (
    <div style={{
      width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
      background: isOffline ? 'transparent' : colorMap[status],
      border: isOffline ? `2px solid #d1d5db` : 'none',
      boxShadow: withGlow && status === 'studying'
        ? `0 0 0 3px rgba(16, 185, 129, 0.2)`
        : 'none',
    }} />
  );
}

function getAvatarGradient(name: string) {
  const gradients = [
    'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
    'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
    'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
    'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)',
    'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
    'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return gradients[sum % gradients.length];
}

const statusOrder: Record<PresenceStatus, number> = {
  studying: 1,
  break: 2,
  idle: 3,
  offline: 4,
};

export function PresenceSidebar({ members, currentUserId, isAdmin, onKick }: PresenceSidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [popoverId, setPopoverId] = useState<string | null>(null);

  const sorted = [...members].sort((a, b) => {
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (b.role === 'admin' && a.role !== 'admin') return 1;
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <div style={{
      width: 280,
      background: 'rgba(255, 255, 255, 0.4)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(165, 180, 252, 0.2)',
      borderRadius: 24,
      height: '100%',
      overflowY: 'auto',
      flexShrink: 0,
      fontFamily: "'Outfit', sans-serif",
      paddingBottom: 16,
    }}>
      <div style={{ padding: '24px 20px 16px' }}>
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#6366f1'
        }}>
          Participants
          <span style={{ 
            background: 'rgba(165, 180, 252, 0.2)', color: '#4f46e5',
            padding: '2px 8px', borderRadius: 999, fontSize: 12, fontWeight: 700,
          }}>
            {members.length}
          </span>
        </div>
      </div>

      <div style={{ paddingBottom: 16 }}>
        {sorted.map(member => {
          const isMe = member.user_id === currentUserId;
          const canKick = isAdmin && !isMe && member.role !== 'admin';

          return (
            <div
              key={member.user_id}
              onMouseEnter={() => setHoveredId(member.user_id)}
              onMouseLeave={() => { setHoveredId(null); if (popoverId === member.user_id) setPopoverId(null); }}
              data-testid={`presence-member-${member.user_id}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                height: 64, padding: '0 20px',
                background: hoveredId === member.user_id ? 'rgba(255, 255, 255, 0.5)' : 'transparent',
                transition: `all 0.2s ease`,
                position: 'relative',
              }}
            >
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: getAvatarGradient(member.display_name),
                  border: '2px solid #ffffff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#4f46e5', fontWeight: 700, fontSize: 15,
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.1)'
                }}>
                  {member.display_name.charAt(0).toUpperCase()}
                </div>
                <div style={{ 
                  position: 'absolute', bottom: -2, right: -2, 
                  background: '#fff', borderRadius: '50%', padding: 3 
                }}>
                  <PresenceDot status={member.status} withGlow />
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#1e1b4b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {member.display_name}
                    {isMe && <span style={{ color: '#818cf8', fontWeight: 500 }}> (you)</span>}
                  </span>
                  {member.role === 'admin' && (
                    <Crown size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
                  )}
                </div>
                <div style={{ fontSize: 13, color: '#6366f1', marginTop: 2, fontWeight: 500 }}>
                  {member.status === 'studying' ? 'Studying' : member.status === 'break' ? 'On break' : 'Idle'}
                </div>
              </div>

              {member.role === 'admin' && (
                <div style={{
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
                  padding: '4px 8px', borderRadius: 8,
                  background: 'rgba(245, 158, 11, 0.1)',
                  color: '#d97706',
                  flexShrink: 0,
                }}>
                  Host
                </div>
              )}

              {canKick && hoveredId === member.user_id && (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setPopoverId(popoverId === member.user_id ? null : member.user_id)}
                    style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(165,180,252,0.4)', borderRadius: 8, cursor: 'pointer', color: '#6366f1', padding: 6 }}
                    data-testid={`button-member-menu-${member.user_id}`}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  {popoverId === member.user_id && (
                    <div style={{
                      position: 'absolute', right: 0, top: 40,
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(165, 180, 252, 0.4)',
                      borderRadius: 12,
                      boxShadow: '0 10px 30px rgba(99, 102, 241, 0.1)',
                      padding: 4, minWidth: 160,
                      zIndex: 100,
                    }}>
                      <button
                        onClick={() => { setPopoverId(null); onKick(member.user_id, member.display_name); }}
                        data-testid={`button-kick-${member.user_id}`}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          width: '100%', padding: '10px 14px',
                          background: 'none', border: 'none', cursor: 'pointer',
                          borderRadius: 8,
                          color: '#ef4444', fontSize: 14, fontWeight: 600,
                          fontFamily: "'Outfit', sans-serif",
                          transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <UserX size={16} />
                        Kick from room
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
