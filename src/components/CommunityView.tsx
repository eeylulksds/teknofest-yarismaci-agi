import React, { useState, useEffect, useRef } from 'react';
import { Send, Hash, Users, ChevronLeft } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { ChatMessage, UserProfile } from '../utils/types';

interface CommunityViewProps {
  currentUser: UserProfile | null;
}

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
  const [showMobileSidebar, setShowMobileSidebar] = useState(false); // Mobil için

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();

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

    setNewMessage('');

    const { error } = await supabase.from('messages').insert([messageToInsert]);
    if (error) {
      alert('Mesaj gönderilemedi: ' + error.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-0 sm:px-4 py-0 sm:py-6 h-[calc(100vh-4rem)] sm:h-[calc(100vh-6rem)]">
      <div className="bg-white dark:bg-slate-900 rounded-none sm:rounded-3xl border-0 sm:border border-slate-200 dark:border-slate-800 shadow-sm flex h-full overflow-hidden transition-colors relative">

        {/* SOL SIDEBAR - Masaüstünde normal, mobilde açılır menü */}
        <div className={`
          w-full sm:w-64 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col
          absolute sm:relative inset-0 z-20 transform transition-transform duration-300
          ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
        `}>
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
            <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-red-600" />
              Topluluk
            </h2>
            <button onClick={() => setShowMobileSidebar(false)} className="sm:hidden p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
              <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
          <div className="p-3 space-y-1 flex-1 overflow-y-auto">
            {CHANNELS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => { setActiveChannel(ch.id); setShowMobileSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${activeChannel === ch.id
                    ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
              >
                <Hash className="w-4 h-4" />
                {ch.name}
              </button>
            ))}
          </div>
        </div>

        {/* SAĞ TARAF - Sohbet Alanı */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 w-full">
          <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center shadow-sm z-10">
            <button onClick={() => setShowMobileSidebar(true)} className="sm:hidden p-1.5 mr-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Users className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
            <Hash className="w-5 h-5 text-slate-400 dark:text-slate-500 mr-2" />
            <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
              {CHANNELS.find((c) => c.id === activeChannel)?.name}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
            {isLoading ? (
              <div className="text-center text-slate-400 dark:text-slate-500 text-sm mt-10">Mesajlar yükleniyor...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-slate-400 dark:text-slate-500 text-sm mt-10">
                Bu kanalda henüz mesaj yok. İlk mesajı sen yaz!
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === currentUser?.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{msg.sender_name}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        {new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div
                      className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl max-w-[85%] sm:max-w-md text-sm shadow-sm ${isMe
                          ? 'bg-red-600 text-white rounded-tr-sm'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-sm'
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

          <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            {!currentUser ? (
              <div className="text-center text-xs text-red-500 font-bold p-3 bg-red-50 dark:bg-red-950/40 rounded-xl">
                Mesaj gönderebilmek için lütfen giriş yapın.
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`#${activeChannel} kanalına mesaj yaz...`}
                  className="flex-1 bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 rounded-full px-4 sm:px-5 py-2.5 sm:py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2.5 sm:p-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-full transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};