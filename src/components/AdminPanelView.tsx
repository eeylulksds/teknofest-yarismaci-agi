import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Users, Megaphone, Trophy, BarChart3, ShieldCheck } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { UserProfile } from '../utils/types';

interface AdminPanelViewProps {
  onBackToSite: () => void;
  currentUser: UserProfile | null; // Hangi adminin işlem yaptığını bilmek için
}

const CATEGORIES = [
  'Eğitim, Araştırma ve Tasarım', 'Enerji, Çevre ve Sürdürülebilirlik',
  'Sağlık Teknolojileri', 'Deniz Araçları ve Sistemleri',
  'Havacılık ve İnsansız Hava Araçları Sistemleri', 'Mobilite ve Akıllı Ulaşım',
  'Uzay ve Roket Teknolojileri', 'Yazılım ve Dijital Teknolojiler',
  'Yapay Zeka ve Veri Teknolojileri', 'Savunma Teknolojileri',
  'Robotik ve Otonom Sistemler', 'Haberleşme ve Ağ Teknolojileri'
];

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({ onBackToSite, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'competitions' | 'users' | 'announcement'>('stats');

  // İstatistik State'leri
  const [stats, setStats] = useState({ users: 0, competitions: 0, messages: 0 });

  // Kullanıcı Listesi State'leri
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Duyuru State'i
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);

  // Yarışma State'i
  const [form, setForm] = useState({
    title: '', category: CATEGORIES[0], organizer: '', description: '',
    application_deadline: '', delivery_milestone_title: 'Kritik Tasarım Raporu',
    delivery_milestone_date: '', kys_portal_url: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [compSuccess, setCompSuccess] = useState(false);

  useEffect(() => {
    fetchStats();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const fetchStats = async () => {
    const [usersRes, compsRes, msgsRes] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('competitions').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true })
    ]);
    setStats({
      users: usersRes.count || 0,
      competitions: compsRes.count || 0,
      messages: msgsRes.count || 0
    });
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data as UserProfile[]);
    setIsLoadingUsers(false);
  };

  // --- YARIŞMA EKLEME ---
  const handleAddCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCompSuccess(false);

    const { error } = await supabase.from('competitions').insert([{
      ...form,
      organizer: form.organizer || null,
      application_deadline: form.application_deadline || null,
      delivery_milestone_date: form.delivery_milestone_date || null,
      kys_portal_url: form.kys_portal_url || null,
      first_prize: 'Belirtilmedi',
      status: 'Başvurular Açık'
    }]);

    if (!error) {
      setCompSuccess(true);
      setForm({ ...form, title: '', description: '', organizer: '', application_deadline: '', kys_portal_url: '' });
      fetchStats(); // İstatistiği güncelle
    } else {
      alert('Hata: ' + error.message);
    }
    setIsSubmitting(false);
  };

  // --- KULLANICI ROLÜNÜ DEĞİŞTİRME ---
  const handleUpdateRole = async (userId: string, newRole: string) => {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
    } else {
      alert('Rol güncellenemedi: ' + error.message);
    }
  };

  // --- DUYURU GÖNDERME ---
  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const { error } = await supabase.from('messages').insert([{
      group_id: 'genel',
      sender_id: currentUser.id,
      sender_name: '📢 SİSTEM DUYURUSU',
      sender_team: 'TEKNOFEST Yönetimi',
      content: announcementText
    }]);

    if (!error) {
      setAnnouncementSuccess(true);
      setAnnouncementText('');
      fetchStats(); // Mesaj sayısını güncelle
      setTimeout(() => setAnnouncementSuccess(false), 3000);
    } else {
      alert('Hata: ' + error.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={onBackToSite} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 font-bold">
        <ArrowLeft className="w-4 h-4" /> Ana Sayfaya Dön
      </button>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm min-h-[500px]">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
          <ShieldCheck className="w-8 h-8 text-red-600" />
          <h1 className="text-2xl font-black text-slate-900">Yönetici Kontrol Paneli</h1>
        </div>

        {/* SEKMELER */}
        <div className="flex gap-2 border-b border-slate-100 pb-4 mb-6 overflow-x-auto">
          <button onClick={() => setActiveTab('stats')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${activeTab === 'stats' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            <BarChart3 className="w-4 h-4" /> İstatistikler
          </button>
          <button onClick={() => setActiveTab('competitions')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${activeTab === 'competitions' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            <Trophy className="w-4 h-4" /> Yarışma Ekle
          </button>
          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${activeTab === 'users' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            <Users className="w-4 h-4" /> Kullanıcılar
          </button>
          <button onClick={() => setActiveTab('announcement')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${activeTab === 'announcement' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            <Megaphone className="w-4 h-4" /> Duyuru Gönder
          </button>
        </div>

        {/* İÇERİK: İSTATİSTİKLER */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-sky-50 rounded-2xl border border-sky-100 text-center">
              <p className="text-sm font-bold text-sky-800">Kayıtlı Kullanıcı</p>
              <p className="text-4xl font-black text-sky-600 mt-2">{stats.users}</p>
            </div>
            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 text-center">
              <p className="text-sm font-bold text-amber-800">Eklenen Yarışma</p>
              <p className="text-4xl font-black text-amber-600 mt-2">{stats.competitions}</p>
            </div>
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
              <p className="text-sm font-bold text-emerald-800">Atılan Mesaj</p>
              <p className="text-4xl font-black text-emerald-600 mt-2">{stats.messages}</p>
            </div>
          </div>
        )}

        {/* İÇERİK: YARIŞMA EKLE */}
        {activeTab === 'competitions' && (
          <form onSubmit={handleAddCompetition} className="space-y-4 text-sm max-w-2xl">
            {compSuccess && <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold">Yarışma başarıyla eklendi!</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-1">Yarışma Adı</label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="block font-bold mb-1">Kategori</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border rounded-xl px-3 py-2">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block font-bold mb-1">Açıklama</label>
              <textarea rows={3} required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded-xl px-3 py-2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-1">Son Başvuru</label>
                <input type="date" value={form.application_deadline} onChange={e => setForm({ ...form, application_deadline: e.target.value })} className="w-full border rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="block font-bold mb-1">Başvuru Linki (Opsiyonel)</label>
                <input value={form.kys_portal_url} onChange={e => setForm({ ...form, kys_portal_url: e.target.value })} className="w-full border rounded-xl px-3 py-2" />
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2">
              <Save className="w-4 h-4" /> {isSubmitting ? 'Ekleniyor...' : 'Yarışmayı Kaydet'}
            </button>
          </form>
        )}

        {/* İÇERİK: KULLANICILAR */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            {isLoadingUsers ? <p>Yükleniyor...</p> : users.map(u => (
              <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 gap-4">
                <div>
                  <p className="font-bold text-slate-900">{u.name}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Rol:</span>
                  <select
                    value={u.role}
                    onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                    className="border border-slate-300 rounded-lg px-2 py-1 text-sm font-semibold bg-white"
                  >
                    <option value="yarismaci">Yarışmacı</option>
                    <option value="kaptan">Kaptan</option>
                    <option value="danisman">Danışman</option>
                    <option value="yonetici">Yönetici</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* İÇERİK: DUYURU GÖNDER */}
        {activeTab === 'announcement' && (
          <form onSubmit={handleSendAnnouncement} className="space-y-4 max-w-2xl">
            {announcementSuccess && <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold">Duyuru başarıyla gönderildi!</div>}
            <div>
              <label className="block font-bold mb-1">Duyuru Mesajı</label>
              <textarea
                rows={5}
                required
                value={announcementText}
                onChange={e => setAnnouncementText(e.target.value)}
                placeholder="Tüm topluluk kanallarına gönderilecek mesajı buraya yazın..."
                className="w-full border rounded-xl px-3 py-2"
              />
            </div>
            <button type="submit" className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2">
              <Megaphone className="w-4 h-4" /> Duyuruyu Gönder
            </button>
          </form>
        )}

      </div>
    </div>
  );
};