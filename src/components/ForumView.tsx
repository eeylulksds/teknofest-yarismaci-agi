import React, { useState, useEffect } from 'react';
import { Plus, MessageSquare, ThumbsUp } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { UserProfile } from '../utils/types';

interface ForumPost {
  id: string;
  title: string;
  author_id: string;
  author_name: string;
  team: string;
  competition: string;
  category: string;
  content: string;
  votes: number;
  is_solved: boolean;
  created_at: string;
}

interface ForumViewProps {
  currentUser: UserProfile | null;
}

export const ForumView: React.FC<ForumViewProps> = ({ currentUser }) => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Yeni konu formu
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('forum_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setPosts(data as ForumPost[]);
    setIsLoading(false);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmitting(true);

    const { error } = await supabase.from('forum_posts').insert([
      {
        title: newTitle,
        author_id: currentUser.id,
        author_name: currentUser.name,
        team: currentUser.teamName || 'Bireysel',
        competition: 'Genel',
        category: 'Genel Tartışma',
        content: newContent,
      }
    ]);

    if (error) {
      alert('Hata: ' + error.message);
    } else {
      setNewTitle('');
      setNewContent('');
      setIsNewPostOpen(false);
      fetchPosts(); // Listeyi yenile
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Teknik Forum</h1>
          <p className="text-slate-500 mt-1">Sorular sor, bilgi paylaş, çözüm bul.</p>
        </div>

        {currentUser && (
          <button
            onClick={() => setIsNewPostOpen(!isNewPostOpen)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md"
          >
            <Plus className="w-4 h-4" /> Yeni Konu Aç
          </button>
        )}
      </div>

      {/* Yeni Konu Formu */}
      {isNewPostOpen && (
        <form onSubmit={handleCreatePost} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-4">
          <h3 className="font-bold text-lg text-slate-900">Yeni Konu Oluştur</h3>
          <input
            type="text"
            placeholder="Konu Başlığı"
            required
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-2"
          />
          <textarea
            placeholder="Sorunuzu veya paylaşmak istediğiniz bilgiyi buraya yazın..."
            required
            rows={4}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-2"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsNewPostOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl">
              İptal
            </button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl">
              {isSubmitting ? 'Gönderiliyor...' : 'Paylaş'}
            </button>
          </div>
        </form>
      )}

      {/* Konu Listesi */}
      {isLoading ? (
        <div className="text-center py-20 text-slate-500">Forum yükleniyor...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">Henüz konu açılmamış</h3>
          <p className="text-sm text-slate-500 mt-1">İlk teknik soruyu veya tartışmayı siz başlatın!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-red-300 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 bg-sky-50 text-sky-700 rounded-md text-[11px] font-bold border border-sky-200">
                  {post.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {new Date(post.created_at).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{post.title}</h3>
              <p className="text-sm text-slate-600 line-clamp-2">{post.content}</p>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                    {post.author_name?.[0]}
                  </div>
                  <span className="font-semibold text-slate-700">{post.author_name}</span>
                  <span>({post.team})</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> {post.votes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};