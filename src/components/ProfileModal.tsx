import React, { useState, useEffect } from 'react';
import { X, Save, User, GraduationCap, Trophy, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { UserProfile } from '../utils/types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUpdate: () => void; // Bilgiler güncellendiğinde App.tsx'i haberdar etmek için
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, currentUser, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    team_name: '',
    institution: '',
    bio: '',
    skills: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Modal açıldığında mevcut bilgileri forma doldur
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        team_name: currentUser.teamName || '',
        institution: currentUser.institution || '',
        bio: currentUser.bio || '',
        skills: currentUser.skills ? currentUser.skills.join(', ') : '',
      });
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSuccess(false);

    // Supabase'deki profiles tablosunu güncelle
    const { error } = await supabase
      .from('profiles')
      .update({
        name: formData.name,
        team_name: formData.team_name,
        institution: formData.institution,
        bio: formData.bio,
        skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
      })
      .eq('id', currentUser.id);

    if (!error) {
      setIsSuccess(true);
      onUpdate(); // Ana sayfadaki kullanıcı bilgilerini yenile
      setTimeout(() => setIsSuccess(false), 3000); // 3 saniye sonra başarı mesajını kaldır
    } else {
      alert('Hata: ' + error.message);
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col max-h-[90vh]">

        {/* Başlık */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900">Profil Bilgilerim</h2>
              <p className="text-xs text-slate-500">Kendini tanıt, takımını bul</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto">
          {isSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" /> Profiliniz başarıyla güncellendi!
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4 text-sm">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Ad Soyad</label>
              <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-slate-300 rounded-xl px-3 py-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-amber-500" /> Takım Adı</label>
                <input value={formData.team_name} onChange={(e) => setFormData({ ...formData, team_name: e.target.value })} className="w-full border border-slate-300 rounded-xl px-3 py-2" placeholder="Örn: Hürkuş İHA" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5 text-sky-500" /> Okul / Kurum</label>
                <input value={formData.institution} onChange={(e) => setFormData({ ...formData, institution: e.target.value })} className="w-full border border-slate-300 rounded-xl px-3 py-2" placeholder="Örn: İTÜ" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Hakkımda (Biyografi)</label>
              <textarea rows={3} value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="w-full border border-slate-300 rounded-xl px-3 py-2" placeholder="Kendinden ve projelerinden bahset..." />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Yetenekler (Virgülle ayırın)</label>
              <input value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} className="w-full border border-slate-300 rounded-xl px-3 py-2" placeholder="Python, C++, ROS2, SolidWorks" />
            </div>

            <button type="submit" disabled={isSaving} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-4">
              <Save className="w-4 h-4" />
              {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};