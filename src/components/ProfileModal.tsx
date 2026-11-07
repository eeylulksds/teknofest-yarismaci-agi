import React, { useState, useEffect, useRef } from 'react';
import { X, Save, User, GraduationCap, Trophy, CheckCircle2, Upload } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { UserProfile } from '../utils/types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUpdate: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, currentUser, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    team_name: '',
    institution: '',
    bio: '',
    skills: '',
    avatar_url: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        team_name: currentUser.teamName || '',
        institution: currentUser.institution || '',
        bio: currentUser.bio || '',
        skills: currentUser.skills ? currentUser.skills.join(', ') : '',
        avatar_url: currentUser.avatarUrl || '',
      });
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUser.id}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      alert('Fotoğraf yüklenemedi: ' + uploadError.message);
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    setFormData({ ...formData, avatar_url: data.publicUrl });
    setIsUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSuccess(false);

    const { error } = await supabase
      .from('profiles')
      .update({
        name: formData.name,
        team_name: formData.team_name,
        institution: formData.institution,
        bio: formData.bio,
        skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
        avatar_url: formData.avatar_url,
      })
      .eq('id', currentUser.id);

    if (!error) {
      setIsSuccess(true);
      onUpdate();
      setTimeout(() => setIsSuccess(false), 3000);
    } else {
      alert('Hata: ' + error.message);
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
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

        <div className="p-6 overflow-y-auto">
          {isSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" /> Profiliniz başarıyla güncellendi!
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4 text-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden border-2 border-slate-100">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <User className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {isUploading ? 'Yükleniyor...' : 'Fotoğraf Yükle'}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </div>
            </div>

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

            <button type="submit" disabled={isSaving || isUploading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
              <Save className="w-4 h-4" />
              {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};