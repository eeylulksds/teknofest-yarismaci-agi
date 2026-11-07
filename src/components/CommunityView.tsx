import React, { useState, useEffect, useRef } from 'react';
import { Send, Hash, Users } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { ChatMessage, UserProfile } from '../utils/types';

interface CommunityViewProps {
  currentUser: UserProfile | null;
}

// Şimdilik sabit kanallar, ileride veritabanından çekebiliriz
const CHANNELS = [
  { id: 'genel', name: 'Genel Sohbet' },
  { id: 'yardim', name: 'Yardım & Destek' },
  { id: 'takim-arama', name: 'Takım Arkadaşı Arayanlar' },
];

export const CommunityView: React.FC<CommunityViewProps> = ({ currentUser }) => {
  const [activeChannel, setActiveChannel] = useState('genel');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();

    // Supabase Realtime Aboneliği (Canlı Dinleme)
    const channel = supabase
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${activeChannel}` },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChannel]);

  // Yeni mesaj geldiğinde en alta kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('group_id', activeChannel)
      .order('created_at', { ascending: true });

    if (data) setMessages(data as ChatMessage[]);
    if (error) console.error('Mesajlar çekilemedi:', error);
    setIsLoading(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const messageToInsert = {
      group_id: activeChannel,
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      sender_team: currentUser.teamName || 'Bireysel',
      content: newMessage.trim(),
    };

    setNewMessage(''); // Hemen temizle

    const { error } = await supabase.from('messages').insert([messageToInsert]);
    if (error) {
      alert('Mesaj gönderilemedi: ' + error.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-5rem)]">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex h-full overflow-hidden">

        {/* SOL SIDEBAR: Kanallar */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h2 className="font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-red-600" />
              Topluluk
            </h2>
          </div>
          <div className="p-3 space-y-1 flex-1 overflow-y-auto">
            {CHANNELS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${activeChannel === ch.id
                    ? 'bg-red-100 text-red-700'
                    : 'text-slate-600 hover:bg-slate-200'
                  }`}
              >
                <Hash className="w-4 h-4" />
                {ch.name}
              </button>
            ))}
          </div>
        </div>

        {/* SAĞ TARAF: Sohbet */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="p-4 border-b border-slate-200 flex items-center shadow-sm z-10">
            <Hash className="w-6 h-6 text-slate-400 mr-2" />
            <h2 className="font-bold text-lg text-slate-900">
              {CHANNELS.find((c) => c.id === activeChannel)?.name}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {isLoading ? (
              <div className="text-center text-slate-400 text-sm mt-10">Mesajlar yükleniyor...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-slate-400 text-sm mt-10">
                Bu kanalda henüz mesaj yok. İlk mesajı sen yaz!
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === currentUser?.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-700">{msg.sender_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div
                      className={`px-4 py-2.5 rounded-2xl max-w-md text-sm shadow-sm ${isMe
                          ? 'bg-red-600 text-white rounded-tr-sm'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                        }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-slate-200 bg-white">
            {!currentUser ? (
              <div className="text-center text-sm text-red-500 font-bold p-3 bg-red-50 rounded-xl">
                Mesaj gönderebilmek için lütfen giriş yapın.
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`#${activeChannel} kanalına mesaj yaz...`}
                  className="flex-1 bg-slate-100 border-none rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white rounded-full transition-colors shadow-sm"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};