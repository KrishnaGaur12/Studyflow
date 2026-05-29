import { useState } from 'react';
import { X, Globe, Lock, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface CreateRoomModalProps {
  onClose: () => void;
  onCreated: (roomId: string) => void;
}

type RoomType = 'open' | 'invite';

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function CreateRoomModal({ onClose, onCreated }: CreateRoomModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [type, setType] = useState<RoomType>('open');
  const [loading, setLoading] = useState(false);

  const canCreate = name.trim().length > 0;

  const handleCreate = async () => {
    if (!user || !canCreate) return;
    setLoading(true);
    try {
      const inviteCode = generateInviteCode();
      const { data: room, error } = await supabase
        .from('rooms')
        .insert({
          name: name.trim(),
          type,
          invite_code: inviteCode,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('room_members').insert({
        room_id: room.id,
        user_id: user.id,
        role: 'admin',
      });

      toast({ variant: 'success', title: 'Room created', body: name.trim() });
      onCreated(room.id);
    } catch (err: any) {
      toast({ variant: 'error', title: 'Failed to create room', body: err.message });
    } finally {
      setLoading(false);
    }
  };

  const types: { value: RoomType; label: string; icon: typeof Globe; helper: string }[] = [
    { value: 'open', label: 'Open Room', icon: Globe, helper: 'Anyone with the link can join.' },
    { value: 'invite', label: 'Invite-only', icon: Lock, helper: 'Only people with your invite link.' },
  ];

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(30, 27, 75, 0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 100,
        }}
      />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(165, 180, 252, 0.4)',
        boxShadow: '0 24px 48px rgba(30, 27, 75, 0.15)',
        borderRadius: 24,
        padding: 40,
        width: '90%', maxWidth: 520,
        zIndex: 101,
        fontFamily: "'Outfit', sans-serif",
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <h2 style={{ 
              fontSize: 28, fontWeight: 700, color: '#1e1b4b', marginBottom: 8,
              fontFamily: "'Playfair Display', serif", letterSpacing: '-0.02em'
            }}>
              New study room
            </h2>
            <p style={{ fontSize: 15, color: '#6366f1' }}>Create a space to focus with others.</p>
          </div>
          <button
            onClick={onClose}
            style={{ 
              background: 'rgba(165, 180, 252, 0.15)', border: 'none', cursor: 'pointer', 
              color: '#4f46e5', width: 36, height: 36, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(165, 180, 252, 0.3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(165, 180, 252, 0.15)'}
            data-testid="button-close-modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Room name */}
        <div style={{ marginBottom: 32 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#4f46e5', marginBottom: 12 }}>
            Room name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Finals week — Discrete Math"
            autoFocus
            data-testid="input-room-name"
            style={{
              width: '100%', height: 48, padding: '0 16px',
              background: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(165, 180, 252, 0.4)',
              borderRadius: 12,
              color: '#1e1b4b', fontSize: 15,
              outline: 'none', boxSizing: 'border-box',
              fontFamily: "'Outfit', sans-serif",
              transition: 'border-color 0.2s ease',
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
            onBlur={e => e.currentTarget.style.borderColor = 'rgba(165, 180, 252, 0.4)'}
          />
        </div>

        {/* Who can join */}
        <div style={{ marginBottom: 32 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#4f46e5', marginBottom: 12 }}>
            Who can join
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {types.map(({ value, label, icon: Icon, helper }) => {
              const selected = type === value;
              return (
                <button
                  key={value}
                  onClick={() => setType(value)}
                  data-testid={`radio-room-type-${value}`}
                  style={{
                    padding: 20, borderRadius: 16, cursor: 'pointer',
                    border: selected ? '2px solid #4f46e5' : '1px solid rgba(165, 180, 252, 0.4)',
                    background: selected ? 'rgba(79, 70, 229, 0.05)' : 'rgba(255, 255, 255, 0.6)',
                    textAlign: 'left',
                    transition: `all 0.2s ease`,
                    position: 'relative',
                  }}
                  onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(165, 180, 252, 0.8)' }}
                  onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(165, 180, 252, 0.4)' }}
                >
                  <Icon size={20} style={{ color: selected ? '#4f46e5' : '#818cf8', marginBottom: 12 }} />
                  <div style={{ fontSize: 15, fontWeight: 700, color: selected ? '#4f46e5' : '#1e1b4b', marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 13, color: '#6366f1', lineHeight: 1.5 }}>{helper}</div>
                  {selected && (
                    <div style={{
                      position: 'absolute', top: 16, right: 16,
                      width: 10, height: 10, borderRadius: '50%',
                      background: '#4f46e5',
                      boxShadow: '0 0 0 4px rgba(79, 70, 229, 0.2)'
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 40 }}>
          <button
            onClick={onClose}
            style={{
              height: 48, padding: '0 24px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#6366f1', fontSize: 15, fontWeight: 600,
              borderRadius: 12,
              fontFamily: "'Outfit', sans-serif",
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(165, 180, 252, 0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!canCreate || loading}
            data-testid="button-create-room"
            style={{
              height: 48, padding: '0 32px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#ffffff', border: 'none',
              cursor: !canCreate || loading ? 'not-allowed' : 'pointer',
              fontSize: 15, fontWeight: 600, borderRadius: 12,
              display: 'flex', alignItems: 'center', gap: 10,
              opacity: !canCreate || loading ? 0.6 : 1,
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
              transition: 'all 0.2s ease',
              fontFamily: "'Outfit', sans-serif",
            }}
            onMouseEnter={e => { if (canCreate && !loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(79, 70, 229, 0.4)'; } }}
            onMouseLeave={e => { if (canCreate && !loading) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(79, 70, 229, 0.3)'; } }}
          >
            {loading && <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />}
            Create Room
          </button>
        </div>
      </div>
    </>
  );
}
