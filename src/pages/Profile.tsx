import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, Flame, Edit2, Sparkles, User, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { RouteGuard } from '@/components/RouteGuard';
import { TopNav } from '@/components/TopNav';

export default function Profile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', username: '', quote: '', avatarUrl: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        username: user.user_metadata?.username || user.email?.split('@')[0] || '',
        quote: user.user_metadata?.quote || "Discipline today, freedom tomorrow.",
        avatarUrl: user.user_metadata?.avatar_url || '',
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: editForm.name,
          username: editForm.username,
          quote: editForm.quote,
          avatar_url: editForm.avatarUrl
        }
      });
      if (error) throw error;
      
      await supabase.from('profiles').update({ display_name: editForm.name }).eq('id', user.id);
      
      setIsEditingProfile(false);
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      alert('Error saving profile: ' + err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

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
                <Link href="/dashboard" title="Back to stats">
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
                <h1 style={{ 
                  fontSize: 42, fontWeight: 800, 
                  fontFamily: "'Manrope', sans-serif",
                  color: '#1e1b4b', letterSpacing: '-0.03em',
                  display: 'flex', alignItems: 'center', gap: 12
                }}>
                  My Profile <Sparkles size={32} style={{ color: '#eab308', fill: '#eab308' }} />
                </h1>
              </div>
              <p style={{ fontSize: 16, color: '#6b7280', marginLeft: 52, fontWeight: 500 }}>
                Track your progress, celebrate wins, and level up every day.
              </p>
            </div>

            {/* Profile Card */}
            <div style={{
              position: 'relative',
              borderRadius: 32,
              padding: '48px 40px',
              marginBottom: 48,
              display: 'flex',
              gap: 40,
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.45)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255, 255, 255, 0.7)',
              boxShadow: '0 20px 40px rgba(99, 102, 241, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.5)',
              overflow: 'hidden'
            }}>
              {/* Subtle background gradient to add a tiny bit of depth behind the glass */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)',
                zIndex: 0, pointerEvents: 'none'
              }} />

              {/* Edit Profile Button */}
              <button 
                onClick={() => setIsEditingProfile(true)}
                style={{
                  position: 'absolute', top: 32, right: 32,
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: 999,
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(165, 180, 252, 0.4)',
                  color: '#4f46e5', fontSize: 14, fontWeight: 700,
                  fontFamily: "'Manrope', sans-serif",
                  cursor: 'pointer', zIndex: 10,
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.05)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)'; e.currentTarget.style.transform = 'none'; }}
              >
                <Edit2 size={16} /> Edit Profile
              </button>

              {/* Avatar */}
              <div style={{ position: 'relative', zIndex: 10 }}>
                <div style={{
                  width: 140, height: 140, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                  padding: 4, // creates the yellow ring effect by adding an inner div
                  boxShadow: '0 0 0 4px rgba(234, 179, 8, 0.8), 0 12px 30px rgba(234, 179, 8, 0.2)',
                }}>
                  <div style={{
                    width: '100%', height: '100%', borderRadius: '50%',
                    background: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={64} style={{ color: '#818cf8' }} />
                    )}
                  </div>
                </div>
                {/* Avatar Edit Badge */}
                <button 
                  onClick={() => setIsEditingProfile(true)}
                  style={{
                    position: 'absolute', bottom: 4, right: 4,
                    width: 36, height: 36, borderRadius: '50%',
                    background: '#fff', border: '1px solid #e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    color: '#4b5563', transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#4f46e5'}
                  onMouseLeave={e => e.currentTarget.style.color = '#4b5563'}
                >
                  <Edit2 size={16} />
                </button>
              </div>

              {/* Profile Details */}
              <div style={{ display: 'flex', flexDirection: 'column', zIndex: 10, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <h2 style={{ fontSize: 32, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
                    {user?.user_metadata?.full_name || user?.user_metadata?.name || 'Krishna Gaur'}
                  </h2>
                  <CheckCircle size={24} style={{ color: '#eab308', fill: '#eab308' }} />
                </div>
                <div style={{ fontSize: 16, color: '#6b7280', fontWeight: 500, marginBottom: 20 }}>
                  @{user?.user_metadata?.username || user?.email?.split('@')[0] || 'krishna'}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  {/* Streak Pill */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(30, 41, 59, 0.8)',
                    padding: '8px 16px', borderRadius: 999,
                    color: '#eab308', fontSize: 14, fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <Flame size={18} style={{ color: '#f97316', fill: '#f97316' }} />
                    18 Day Study Streak
                  </div>

                  {/* Status Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#4b5563' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                    In Deep Work Mode
                  </div>
                </div>

                {/* Quote */}
                <p style={{
                  fontSize: 16, fontStyle: 'italic', color: '#4b5563', margin: 0,
                  fontFamily: "'Playfair Display', serif"
                }}>
                  "{user?.user_metadata?.quote || "Discipline today, freedom tomorrow."}"
                </p>
              </div>
            </div>

          </div>
        </div>

        {isEditingProfile && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Manrope', sans-serif"
          }}>
            <div style={{
              background: '#fff', borderRadius: 24, padding: 32, width: '100%', maxWidth: 480,
              boxShadow: '0 24px 48px rgba(0,0,0,0.2)', position: 'relative'
            }}>
              <button 
                onClick={() => setIsEditingProfile(false)}
                style={{
                  position: 'absolute', top: 24, right: 24,
                  background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af'
                }}
              >
                <X size={24} />
              </button>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 24 }}>Edit Profile</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Avatar Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#4b5563', marginBottom: 12 }}>Choose Avatar</label>
                  <div style={{ display: 'flex', gap: 16 }}>
                    {['/pfp1.png', '/pfp2.png'].map(url => (
                      <div 
                        key={url}
                        onClick={() => setEditForm(prev => ({ ...prev, avatarUrl: url }))}
                        style={{
                          width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
                          border: editForm.avatarUrl === url ? '4px solid #4f46e5' : '4px solid transparent',
                          cursor: 'pointer', transition: 'all 0.2s',
                          boxShadow: editForm.avatarUrl === url ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none'
                        }}
                      >
                        <img src={url} alt="Avatar option" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.src = '/logo.png'; }} />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#4b5563', marginBottom: 8 }}>Display Name</label>
                  <input 
                    type="text" 
                    value={editForm.name} 
                    onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #d1d5db',
                      fontSize: 15, fontFamily: "'Manrope', sans-serif", outline: 'none', transition: 'border-color 0.2s'
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                    onBlur={e => e.currentTarget.style.borderColor = '#d1d5db'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#4b5563', marginBottom: 8 }}>Username</label>
                  <input 
                    type="text" 
                    value={editForm.username} 
                    onChange={e => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #d1d5db',
                      fontSize: 15, fontFamily: "'Manrope', sans-serif", outline: 'none', transition: 'border-color 0.2s'
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                    onBlur={e => e.currentTarget.style.borderColor = '#d1d5db'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#4b5563', marginBottom: 8 }}>Favorite Quote</label>
                  <textarea 
                    value={editForm.quote} 
                    onChange={e => setEditForm(prev => ({ ...prev, quote: e.target.value }))}
                    rows={3}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #d1d5db',
                      fontSize: 15, fontFamily: "'Manrope', sans-serif", outline: 'none', transition: 'border-color 0.2s',
                      resize: 'none'
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                    onBlur={e => e.currentTarget.style.borderColor = '#d1d5db'}
                  />
                </div>
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  style={{
                    marginTop: 8, padding: '14px 24px', borderRadius: 12,
                    background: '#4f46e5', color: '#fff', fontSize: 16, fontWeight: 700,
                    border: 'none', cursor: isSavingProfile ? 'not-allowed' : 'pointer',
                    opacity: isSavingProfile ? 0.7 : 1, transition: 'all 0.2s'
                  }}
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
