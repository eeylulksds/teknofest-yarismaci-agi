import React, { useEffect, useState } from 'react';
import { Trophy, Calendar, Clock, ExternalLink, Trash2, LayoutGrid, CalendarDays } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { CompetitionCalendar } from './CompetitionCalendar';
import type { Competition, UserProfile } from '../utils/types';

interface CompetitionsViewProps {
  currentUser: UserProfile | null;
}

export const CompetitionsView: React.FC<CompetitionsViewProps> = ({ currentUser }) => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('competitions').select('*').order('created_at', { ascending: false });
    if (data) setCompetitions(data as Competition[]);
    if (error) console.error('Yarışmalar çekilemedi:', error);
    setIsLoading(false);
  };

  const handleDeleteCompetition = async (id: string) => {
    if (!window.confirm('Bu yarışmayı kalıcı olarak silmek istediğinize emin misiniz?')) return;
    const { error } = await supabase.from('competitions').delete().eq('id', id);
    if (error) alert('Silinirken hata oluştu: ' + error.message);
    else setCompetitions((prev) => prev.filter((c) => c.id !== id));
  };

  if (isLoading) return <div className="text-center py-20 text-slate-500 dark:text-slate-400">Yarışmalar yükleniyor...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Üst Banner - Açık temada beyaz, koyu temada lacivert */}
      <div className="rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm mb-8 relative overflow-hidden transition-colors">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-white/10 text-slate-600 dark:text-sky-200 text-xs font-bold border border-slate-200 dark:border-white/15 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              TEKNOFEST 2026 Resmi Kategori ve Şartnameler
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Teknoloji Yarışmaları <span className="text-sky-600 dark:text-sky-400">ve Şartnameler</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Resmi TEKNOFEST teknoloji yarışmaları, şartnameleri, başvuru takvimleri ve ödül detayları. Başvurularınızı doğrudan aşağıdaki portal üzerinden gerçekleştirebilirsiniz.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a href="https://teknofest.org" target="_blank" rel="noreferrer" className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-md hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-red-600" /> TEKNOFEST Resmi Sitesi
              </a>
              <a href="https://t3kys.com" target="_blank" rel="noreferrer" className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm shadow-md hover:bg-red-700 transition-all flex items-center gap-2">
                <ExternalLink className="w-4 h-4" /> T3KYS
              </a>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="p-4 rounded-2xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-center flex-1 shadow-xs">
              <span className="block text-3xl font-black text-slate-900 dark:text-white">{competitions.length}</span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-300">Aktif Yarışma</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-center flex-1 shadow-xs">
              <span className="block text-3xl font-black text-slate-900 dark:text-white">12</span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-300">Ana Kategori</span>
            </div>
          </div>
        </div>
      </div>

      {/* Liste / Takvim Seçimi */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-red-600" /> Yarışma Listesi
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setViewMode('list')} className={`px-4 py-1.5 text-xs font-bold rounded-full flex items-center gap-2 transition-colors ${viewMode === 'list' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
            <LayoutGrid className="w-3.5 h-3.5" /> Liste
          </button>
          <button onClick={() => setViewMode('calendar')} className={`px-4 py-1.5 text-xs font-bold rounded-full flex items-center gap-2 transition-colors ${viewMode === 'calendar' ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
            <CalendarDays className="w-3.5 h-3.5" /> Etkinlik Takvimi
          </button>
        </div>
      </div>

      {/* İçerik */}
      {viewMode === 'calendar' ? (
        <CompetitionCalendar competitions={competitions} onSelectCompetition={(comp) => { if (comp.kys_portal_url) window.open(comp.kys_portal_url, '_blank'); }} />
      ) : competitions.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <Trophy className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Henüz yarışma eklenmemiş</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Veritabanı şu an boş.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map((comp) => (
            <div key={comp.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all flex flex-col overflow-hidden">
              <div className="p-6 flex-1 space-y-4">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  {comp.category}
                </span>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-snug">{comp.title}</h3>
                {comp.organizer && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Yürütücü: <strong className="text-red-600 dark:text-red-400">{comp.organizer}</strong>
                  </p>
                )}
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">{comp.description}</p>
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-red-500" />
                    <span>Son Başvuru: <strong className="text-slate-900 dark:text-white">{comp.application_deadline}</strong></span>
                  </div>
                  {comp.delivery_milestone_date && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{comp.delivery_milestone_title} Teslim: <strong className="text-slate-900 dark:text-white">{comp.delivery_milestone_date}</strong></span>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <a href={comp.kys_portal_url || 'https://t3kys.com'} target="_blank" rel="noreferrer" className="flex-1 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
                  Başvuru Yap <ExternalLink className="w-3 h-3" />
                </a>
                {currentUser?.role === 'yonetici' && (
                  <button onClick={() => handleDeleteCompetition(comp.id)} className="p-2 rounded-full bg-red-100 dark:bg-red-950/60 hover:bg-red-200 text-red-600 dark:text-red-400 transition-colors" title="Yarışmayı Sil">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};