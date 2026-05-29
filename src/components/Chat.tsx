import { useEffect, useRef, useState, useCallback } from 'react';
import { Send, WifiOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  display_name: string;
}

interface ChatProps {
  roomId: string;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return isToday ? time : `Yesterday ${time}`;
}

export function Chat({ roomId }: ChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [realtimeOk, setRealtimeOk] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Profile cache — avoids async inside realtime callback
  const profileCache = useRef<Map<string, string>>(new Map());
  // Latest message timestamp for polling fallback
  const latestAt = useRef<string | null>(null);

  const scrollToBottom = useCallback((smooth = false) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: smooth ? 'smooth' : 'instant' });
    }
  }, []);

  const addMessages = useCallback((incoming: Message[]) => {
    setMessages(prev => {
      const existing = new Set(prev.map(m => m.id));
      const fresh = incoming.filter(m => !existing.has(m.id));
      if (!fresh.length) return prev;
      const next = [...prev, ...fresh].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      // Track latest timestamp for polling
      const last = next[next.length - 1];
      if (last) latestAt.current = last.created_at;
      return next;
    });
  }, []);

  // ─── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id, user_id, content, created_at')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (cancelled || error) {
        if (!cancelled) setLoading(false);
        return;
      }

      const reversed = (data || []).reverse();

      // Batch-fetch all unique user profiles
      const uniqueUserIds = [...new Set(reversed.map((m: any) => m.user_id))];
      const uncachedIds = uniqueUserIds.filter(uid => !profileCache.current.has(uid));
      if (uncachedIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', uncachedIds);
        if (profiles) {
          for (const p of profiles) {
            profileCache.current.set(p.id, p.display_name);
          }
        }
      }

      const msgs: Message[] = reversed.map((m: any) => {
        const name = profileCache.current.get(m.user_id) || 'Unknown';
        return { id: m.id, user_id: m.user_id, content: m.content, created_at: m.created_at, display_name: name };
      });
      if (msgs.length) latestAt.current = msgs[msgs.length - 1].created_at;
      if (!cancelled) {
        setMessages(msgs);
        setLoading(false);
        setTimeout(scrollToBottom, 50);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [roomId, scrollToBottom]);

  // ─── Realtime subscription ────────────────────────────────────────────────────
  useEffect(() => {
    const channelName = `chat-messages:${roomId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
        (payload) => {
          const m = payload.new as any;
          // Synchronous lookup from cache to avoid async in callback
          const cachedName = profileCache.current.get(m.user_id);
          const msg: Message = {
            id: m.id,
            user_id: m.user_id,
            content: m.content,
            created_at: m.created_at,
            display_name: cachedName || 'Unknown',
          };
          addMessages([msg]);
          setTimeout(() => scrollToBottom(true), 30);

          // Background refresh if name was unknown
          if (!cachedName) {
            supabase.from('profiles').select('display_name').eq('id', m.user_id).single()
              .then(({ data: p }) => {
                if (p?.display_name) {
                  profileCache.current.set(m.user_id, p.display_name);
                  setMessages(prev => prev.map(x =>
                    x.id === m.id ? { ...x, display_name: p.display_name } : x
                  ));
                }
              });
          }
        }
      )
      .subscribe((status) => {
        setRealtimeOk(status === 'SUBSCRIBED' || status === 'CHANNEL_ERROR' ? status === 'SUBSCRIBED' : true);
      });

    return () => { supabase.removeChannel(channel); };
  }, [roomId, addMessages, scrollToBottom]);

  // ─── Polling fallback ─────────────────────────────────────────────────────────
  // Catches any messages that realtime might miss (network blip, filter edge-case)
  useEffect(() => {
    const poll = async () => {
      if (!latestAt.current) return;
      const { data } = await supabase
        .from('messages')
        .select('id, user_id, content, created_at')
        .eq('room_id', roomId)
        .gt('created_at', latestAt.current)
        .order('created_at', { ascending: true })
        .limit(20);

      if (!data?.length) return;

      // Resolve any unknown display names
      const unknownIds = data
        .filter((m: any) => !profileCache.current.has(m.user_id))
        .map((m: any) => m.user_id);
      const uniqueUnknown = [...new Set(unknownIds)];
      if (uniqueUnknown.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', uniqueUnknown);
        if (profiles) {
          for (const p of profiles) {
            profileCache.current.set(p.id, p.display_name);
          }
        }
      }

      const msgs: Message[] = data.map((m: any) => {
        const name = profileCache.current.get(m.user_id) || 'Unknown';
        return { id: m.id, user_id: m.user_id, content: m.content, created_at: m.created_at, display_name: name };
      });
      addMessages(msgs);
      setTimeout(() => scrollToBottom(true), 30);
    };

    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [roomId, addMessages, scrollToBottom]);

  // ─── Send ─────────────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const content = input.trim();
    if (!user || !content || sending) return;
    setInput('');
    setSending(true);
    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = '48px';

    const { error } = await supabase.from('messages').insert({
      room_id: roomId,
      user_id: user.id,
      content,
    });

    if (error) {
      // Re-insert the content if send failed
      setInput(content);
    }
    setSending(false);
  }, [user, input, sending, roomId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = '48px';
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  };

  // ─── Group consecutive messages ────────────────────────────────────────────────
  const grouped = messages.reduce<Array<Message & { showHeader: boolean }>>((acc, msg, i) => {
    const prev = messages[i - 1];
    const showHeader = !prev || prev.user_id !== msg.user_id
      || new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime() > 120_000;
    acc.push({ ...msg, showHeader });
    return acc;
  }, []);

  return (
    <div style={{
      width: 340,
      borderRadius: 24,
      background: 'rgba(255, 255, 255, 0.4)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(165, 180, 252, 0.2)',
      display: 'flex', flexDirection: 'column',
      height: '100%', flexShrink: 0,
      fontFamily: "'Outfit', sans-serif",
      minWidth: 0,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        borderBottom: '1px solid rgba(165, 180, 252, 0.2)', flexShrink: 0,
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Chat
        </span>
        {!realtimeOk && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>
            <WifiOff size={14} />
            Polling
          </div>
        )}
      </div>

      {/* Message list */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
        {loading && (
          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 24, paddingTop: 20 }}>
            {[55, 80, 40, 70].map((w, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: i % 2 === 0 ? 'flex-start' : 'flex-end', gap: 8 }}>
                <div className="sr-skeleton" style={{ width: `${w * 0.5}%`, height: 14, borderRadius: 4 }} />
                <div className="sr-skeleton" style={{ width: `${w}%`, height: 42, borderRadius: 16 }} />
              </div>
            ))}
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '80%', gap: 12,
            color: '#818cf8', textAlign: 'center', padding: '0 24px',
          }}>
            <div style={{ fontSize: 32 }}>💬</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#4f46e5' }}>No messages yet</div>
            <div style={{ fontSize: 14 }}>Be the first to say hi.</div>
          </div>
        )}

        {!loading && grouped.map(msg => {
          const isMe = msg.user_id === user?.id;
          return (
            <div
              key={msg.id}
              style={{
                padding: '2px 20px',
                display: 'flex', flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start',
              }}
            >
              {msg.showHeader && (
                <div style={{
                  fontSize: 12, fontWeight: 700,
                  color: '#6366f1',
                  marginBottom: 6, marginTop: 16,
                  letterSpacing: '0.5px',
                }}>
                  {isMe ? 'You' : msg.display_name}
                  <span style={{ color: '#a5b4fc', fontWeight: 500, marginLeft: 8 }}>
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              )}
              <div
                data-testid={`message-bubble-${msg.id}`}
                style={{
                  maxWidth: '85%',
                  padding: '12px 16px',
                  borderRadius: 16,
                  borderTopLeftRadius: !isMe && msg.showHeader ? 4 : 16,
                  borderTopRightRadius: isMe && msg.showHeader ? 4 : 16,
                  background: isMe 
                    ? 'rgba(79, 70, 229, 0.15)' 
                    : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: isMe 
                    ? '1px solid rgba(79, 70, 229, 0.2)' 
                    : '1px solid rgba(165, 180, 252, 0.4)',
                  boxShadow: isMe ? '0 4px 12px rgba(79, 70, 229, 0.1)' : '0 4px 12px rgba(99, 102, 241, 0.05)',
                  color: isMe ? '#1e1b4b' : '#1e1b4b',
                  fontSize: 14, lineHeight: 1.5,
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <div style={{
        borderTop: '1px solid rgba(165, 180, 252, 0.2)',
        padding: '16px 20px',
        display: 'flex', gap: 12, alignItems: 'flex-end', flexShrink: 0,
        background: 'rgba(255, 255, 255, 0.3)',
      }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Message…"
          rows={1}
          data-testid="input-chat-message"
          style={{
            flex: 1, resize: 'none', height: 48, minHeight: 48, maxHeight: 120,
            padding: '14px 16px',
            color: '#1e1b4b', fontSize: 14,
            background: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(165, 180, 252, 0.4)',
            borderRadius: 12,
            outline: 'none', fontFamily: "'Outfit', sans-serif",
            boxSizing: 'border-box', lineHeight: 1.4,
            transition: 'border-color 0.2s ease',
          }}
          onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
          onBlur={e => e.currentTarget.style.borderColor = 'rgba(165, 180, 252, 0.4)'}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          data-testid="button-send-message"
          title="Send (Enter)"
          style={{
            width: 48, height: 48, borderRadius: 12, flexShrink: 0,
            cursor: input.trim() && !sending ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: input.trim() && !sending ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : 'rgba(165, 180, 252, 0.2)',
            border: 'none',
            color: input.trim() && !sending ? '#ffffff' : '#818cf8',
            boxShadow: input.trim() && !sending ? '0 4px 14px rgba(79, 70, 229, 0.3)' : 'none',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { if (input.trim() && !sending) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(79, 70, 229, 0.4)'; } }}
          onMouseLeave={e => { if (input.trim() && !sending) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(79, 70, 229, 0.3)'; } }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
