import React, { useState } from 'react';
import { X, LogIn, UserPlus, Rocket, KeyRound, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { UserProfile } from '../utils/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
      if (error) throw error;
      if (data.user) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        const userProfile: UserProfile = profileData ? {
          id: profileData.id,
          name: profileData.name,
          email: profileData.email,
          role: profileData.role,
          teamName: profileData.team_name,
          institution: profileData.institution,
          bio: profileData.bio,
          skills: profileData.skills,
        } : { id: data.user.id, name: data.user.email?.split('@')[0] || 'Yarışmacı', email: data.user.email || '', role: 'yarismaci' };
        onLogin(userProfile);
        onClose();
      }
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'E-posta veya şifre hatalı.' : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    if (regPassword.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      setIsLoading(false);
      return;
    }
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email: regEmail, password: regPassword });
      if (authError) throw authError;
      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert([{ id: authData.user.id, name: regName, email: regEmail, role: 'yarismaci' }]);
        if (profileError) throw profileError;
        const newUser: UserProfile = { id: authData.user.id, name: regName, email: regEmail, role: 'yarismaci' };
        onLogin(newUser);
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Şifremi Unuttum Fonksiyonu
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/#update-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.');
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900">TEKNOFEST Girişi</h2>
              <p className="text-xs text-slate-500">Güvenli Oturum</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-100 px-6 pt-3 gap-4">
          <button onClick={() => { setActiveTab('login'); setError(''); setMessage(''); }} className={`pb-3 px-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${activeTab === 'login' ? 'text-red-600 border-red-600' : 'text-slate-500 border-transparent'}`}>
            <LogIn className="w-3.5 h-3.5" /> Giriş
          </button>
          <button onClick={() => { setActiveTab('register'); setError(''); setMessage(''); }} className={`pb-3 px-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${activeTab === 'register' ? 'text-red-600 border-red-600' : 'text-slate-500 border-transparent'}`}>
            <UserPlus className="w-3.5 h-3.5" /> Kayıt Ol
          </button>
        </div>

        <div className="p-6">
          {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs flex items-center gap-2 border border-red-100"><AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span></div>}
          {message && <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs border border-emerald-100"><span>{message}</span></div>}

          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">E-Posta</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:border-blue-500 focus:bg-white" placeholder="ornek@teknofest.org" />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Şifre</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:border-blue-500 focus:bg-white" placeholder="••••••••" />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => { setActiveTab('forgot'); setError(''); setMessage(''); }} className="text-[11px] text-slate-500 hover:text-red-600 font-semibold underline">
                  Şifremi Unuttum
                </button>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />} {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ad Soyad</label>
                <input type="text" required value={regName} onChange={(e) => setRegName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:border-blue-500" placeholder="Örn: Ayşe Kaya" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">E-Posta</label>
                <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:border-blue-500" placeholder="ornek@universite.edu.tr" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Şifre (Min. 6 Karakter)</label>
                <input type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:border-blue-500" placeholder="••••••••" />
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} {isLoading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol'}
              </button>
            </form>
          )}

          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
              <div>
                <p className="text-slate-600 mb-3 leading-relaxed">E-posta adresinizi girin, size bir şifre sıfırlama bağlantısı gönderelim.</p>
                <label className="block font-semibold text-slate-700 mb-1">E-Posta</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:border-blue-500 focus:bg-white" placeholder="ornek@teknofest.org" />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} {isLoading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
              </button>
              <div className="text-center pt-2">
                <button type="button" onClick={() => setActiveTab('login')} className="text-slate-500 hover:text-slate-800 text-[11px] font-semibold underline">
                  Girişe Geri Dön
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};