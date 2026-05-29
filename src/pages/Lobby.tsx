import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Plus, Users, ArrowRight } from 'lucide-react';
import { supabase, type Room } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { RouteGuard } from '@/components/RouteGuard';
import { TopNav } from '@/components/TopNav';
import { RoomCard } from '@/components/RoomCard';
import { CreateRoomModal } from '@/components/CreateRoomModal';

export default function Lobby() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [viewMode, setViewMode] = useState<'yours' | 'global'>('yours');

  const displayedRooms = viewMode === 'yours' 
    ? rooms.filter(room => room.created_by === user?.id)
    : rooms;

  const fetchRooms = async () => {
    const { data } = await supabase
      .from('rooms')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setRooms(data);
    setLoading(false);
  };

  useEffect(() => { fetchRooms(); }, []);

  // Join (open room) or navigate to room if already a member
  const joinRoom = async (room: Room) => {
    if (!user) return;
    const role = room.created_by === user.id ? 'admin' : 'member';
    const { error } = await supabase.from('room_members').insert({
      room_id: room.id,
      user_id: user.id,
      role,
    });
    if (error && !error.message.toLowerCase().includes('duplicate')) {
      toast({ variant: 'error', title: 'Could not join room', body: error.message });
      return;
    }
    setLocation(`/rooms/${room.id}`);
  };

  const handleRoomClick = async (room: Room) => {
    if (!user) return;

    // Already a member — go straight in
    const { data: membership } = await supabase
      .from('room_members')
      .select('id')
      .eq('room_id', room.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (membership) {
      // Re-promote creator to admin if they came back as member
      if (room.created_by === user.id) {
        await supabase.from('room_members')
          .update({ role: 'admin' })
          .eq('room_id', room.id)
          .eq('user_id', user.id);
      }
      setLocation(`/rooms/${room.id}`);
      return;
    }

    if (room.type === 'invite') {
      toast({
        variant: 'error',
        title: 'Invite-only room',
        body: 'Ask the host for an invite link to join.',
      });
      return;
    }

    // Open room — join immediately
    await joinRoom(room);
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode.trim()) {
      setLocation(`/join/${inviteCode.trim()}`);
    }
  };

  return (
    <RouteGuard>
      <div style={{ minHeight: '100vh', background: 'transparent', fontFamily: "'Manrope', sans-serif" }}>
        <TopNav />
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: `120px 32px 80px`, // Extra top padding to account for fixed TopNav
        }}>
          {/* Page header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24,
            marginBottom: 48, padding: '40px',
            background: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 24,
            border: '1px solid rgba(165, 180, 252, 0.3)',
            boxShadow: '0 10px 30px rgba(99, 102, 241, 0.08)',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <img src="/logo.png" alt="StudyFlow" style={{ height: 32, objectFit: 'contain', mixBlendMode: 'multiply' }} />
                <span style={{ fontSize: 16, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '2px' }}>
                  Dashboard
                </span>
              </div>
              <h1 style={{
                fontSize: 42, fontWeight: 700,
                color: '#1e1b4b', letterSpacing: '-0.02em',
                fontFamily: "'Manrope', sans-serif",
                marginBottom: 8,
              }}>
                {viewMode === 'yours' ? 'Your Rooms' : 'Global Rooms'}
              </h1>
              <p style={{ fontSize: 16, color: '#6366f1', marginBottom: 24 }}>Join an open room or create your own.</p>
              
              <div style={{
                display: 'flex', background: 'rgba(255,255,255,0.4)',
                padding: 4, borderRadius: 12, width: 'fit-content',
                border: '1px solid rgba(165,180,252,0.3)',
              }}>
                <button
                  onClick={() => setViewMode('yours')}
                  style={{
                    padding: '8px 24px',
                    borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontSize: 14, fontWeight: 700, fontFamily: "'Manrope', sans-serif",
                    background: viewMode === 'yours' ? '#fff' : 'transparent',
                    color: viewMode === 'yours' ? '#4f46e5' : '#6366f1',
                    boxShadow: viewMode === 'yours' ? '0 2px 8px rgba(99,102,241,0.1)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Your Rooms
                </button>
                <button
                  onClick={() => setViewMode('global')}
                  style={{
                    padding: '8px 24px',
                    borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontSize: 14, fontWeight: 700, fontFamily: "'Manrope', sans-serif",
                    background: viewMode === 'global' ? '#fff' : 'transparent',
                    color: viewMode === 'global' ? '#4f46e5' : '#6366f1',
                    boxShadow: viewMode === 'global' ? '0 2px 8px rgba(99,102,241,0.1)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Global
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <form onSubmit={handleJoinByCode} style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Invite code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  style={{
                    height: 48, width: 160, padding: '0 16px',
                    color: '#1e1b4b', fontSize: 15,
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid rgba(165, 180, 252, 0.4)',
                    borderRight: 'none',
                    borderRadius: '12px 0 0 12px',
                    outline: 'none',
                    fontFamily: "'Manrope', sans-serif",
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(165, 180, 252, 0.4)'}
                />
                <button
                  type="submit"
                  disabled={!inviteCode.trim()}
                  style={{
                    height: 48, width: 48,
                    borderRadius: '0 12px 12px 0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: inviteCode.trim() ? '#4f46e5' : 'rgba(165, 180, 252, 0.2)',
                    color: inviteCode.trim() ? '#fff' : '#818cf8',
                    border: inviteCode.trim() ? '1px solid #4f46e5' : '1px solid rgba(165, 180, 252, 0.4)',
                    cursor: inviteCode.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ArrowRight size={18} />
                </button>
              </form>

              <button
                onClick={() => setShowCreateModal(true)}
                data-testid="button-create-room"
                style={{
                  height: 48, padding: '0 24px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: '#ffffff',
                  border: 'none', borderRadius: 12,
                  fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                  transition: 'all 0.2s ease',
                  fontFamily: "'Manrope', sans-serif",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(79, 70, 229, 0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(79, 70, 229, 0.3)'; }}
              >
                <Plus size={18} />
                New room
              </button>
            </div>
          </div>

          {/* Room grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{
                  borderRadius: 24, padding: 32,
                  display: 'flex', flexDirection: 'column', gap: 16,
                  background: 'rgba(255, 255, 255, 0.5)',
                  border: '1px solid rgba(165, 180, 252, 0.2)',
                }}>
                  <div className="sr-skeleton" style={{ width: '60%', height: 24, borderRadius: 12 }} />
                  <div className="sr-skeleton" style={{ width: '40%', height: 16, borderRadius: 8 }} />
                  <div className="sr-skeleton" style={{ width: '70%', height: 32, borderRadius: 16, marginTop: 8 }} />
                </div>
              ))}
            </div>
          ) : displayedRooms.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              paddingTop: 80, gap: 20, textAlign: 'center',
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: 24,
                background: 'rgba(255, 255, 255, 0.6)',
                border: '1px solid rgba(165, 180, 252, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.08)'
              }}>
                <Users size={40} style={{ color: '#818cf8', strokeWidth: 1.5 }} />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e1b4b', fontFamily: "'Manrope', sans-serif" }}>
                No rooms yet
              </h2>
              <p style={{ fontSize: 16, color: '#6366f1', maxWidth: 320, lineHeight: 1.6 }}>
                Create one to start studying together and track your focus.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  height: 44, padding: '0 24px', marginTop: 12,
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
                Create a room
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {displayedRooms.map(room => (
                <RoomCard key={room.id} room={room} onClick={() => handleRoomClick(room)} />
              ))}
            </div>
          )}
        </div>

        {showCreateModal && (
          <CreateRoomModal
            onClose={() => setShowCreateModal(false)}
            onCreated={(id) => {
              setShowCreateModal(false);
              fetchRooms();
              setLocation(`/rooms/${id}`);
            }}
          />
        )}
      </div>
    </RouteGuard>
  );
}
