import React, { useState } from 'react';
import { Trophy, MessageSquare, Users, LogIn, LogOut, ChevronDown, User, ShieldCheck, Sun, Moon, Menu, X } from 'lucide-react';
import type { UserProfile } from '../utils/types';

interface NavbarProps {
    activeTab: 'competitions' | 'forum' | 'community';
    setActiveTab: (tab: 'competitions' | 'forum' | 'community') => void;
    onLoginClick: () => void;
    currentUser: UserProfile | null;
    onLogout: () => void;
    onProfileClick: () => void;
    onOpenAdminPanel: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
    activeTab,
    setActiveTab,
    onLoginClick,
    currentUser,
    onLogout,
    onProfileClick,
    onOpenAdminPanel
}) => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleTheme = () => {
        const root = document.documentElement;
        if (root.classList.contains('dark')) {
            root.classList.remove('dark');
            localStorage.theme = 'light';
        } else {
            root.classList.add('dark');
            localStorage.theme = 'dark';
        }
    };

    return (
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo - GERÇEK TEKNOFEST LOGOSU */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('competitions')}>
                        <img
                            src="/teknofest-logo.png"
                            alt="TEKNOFEST"
                            className="h-10 w-auto object-contain"
                        />
                        <div className="flex flex-col">
                            <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">TEKNOFEST Yarışmacı Ağı</span>
                        </div>
                    </div>

                    {/* Masaüstü Menü (Orta) */}
                    <nav className="hidden md:flex items-center space-x-2">
                        <button onClick={() => setActiveTab('competitions')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'competitions' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                            <Trophy className="w-4 h-4" /> <span>Yarışmalar</span>
                        </button>
                        <button onClick={() => setActiveTab('forum')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'forum' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                            <MessageSquare className="w-4 h-4" /> <span>Forum</span>
                        </button>
                        <button onClick={() => setActiveTab('community')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'community' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                            <Users className="w-4 h-4" /> <span>Topluluk</span>
                        </button>
                    </nav>

                    {/* Sağ Taraf */}
                    <div className="flex items-center space-x-2">
                        {/* Tema Butonu */}
                        <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <Sun className="w-4 h-4 hidden dark:block" />
                            <Moon className="w-4 h-4 block dark:hidden" />
                        </button>

                        {/* Profil / Giriş (Masaüstünde) */}
                        <div className="hidden sm:block">
                            {currentUser ? (
                                <div className="relative">
                                    <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-full transition-colors">
                                        {currentUser.avatarUrl ? (
                                            <img src={currentUser.avatarUrl} alt="Profil" className="w-6 h-6 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{currentUser.name?.[0].toUpperCase()}</div>
                                        )}
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-[80px] truncate">{currentUser.name}</span>
                                        <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    </button>

                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg py-1">
                                            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                                            </div>

                                            <button onClick={() => { setIsUserMenuOpen(false); onProfileClick(); }} className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                                <User className="w-3.5 h-3.5 text-sky-600" /> Profilim
                                            </button>

                                            {currentUser.role === 'yonetici' && (
                                                <button onClick={() => { setIsUserMenuOpen(false); onOpenAdminPanel(); }} className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2">
                                                    <ShieldCheck className="w-3.5 h-3.5" /> Yönetim Paneli
                                                </button>
                                            )}

                                            <button onClick={() => { setIsUserMenuOpen(false); onLogout(); }} className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2">
                                                <LogOut className="w-3.5 h-3.5" /> Oturumu Kapat
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button onClick={onLoginClick} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full text-sm font-bold transition-colors shadow-sm">
                                    <LogIn className="w-4 h-4" /> Giriş Yap
                                </button>
                            )}
                        </div>

                        {/* Mobil Menü Butonu (Hamburger) */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobil Açılır Menü */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-2 animate-in slide-in-from-top duration-200">
                    <button onClick={() => { setActiveTab('competitions'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'competitions' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                        <Trophy className="w-5 h-5" /> Yarışmalar
                    </button>
                    <button onClick={() => { setActiveTab('forum'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'forum' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                        <MessageSquare className="w-5 h-5" /> Forum
                    </button>
                    <button onClick={() => { setActiveTab('community'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'community' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                        <Users className="w-5 h-5" /> Topluluk
                    </button>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                        {currentUser ? (
                            <div className="space-y-2">
                                <div className="px-4 py-2">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                                    <p className="text-xs text-slate-500">{currentUser.email}</p>
                                </div>
                                <button onClick={() => { onProfileClick(); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                                    <User className="w-5 h-5 text-sky-600" /> Profilim
                                </button>
                                {currentUser.role === 'yonetici' && (
                                    <button onClick={() => { onOpenAdminPanel(); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40">
                                        <ShieldCheck className="w-5 h-5" /> Yönetim Paneli
                                    </button>
                                )}
                                <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40">
                                    <LogOut className="w-5 h-5" /> Oturumu Kapat
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm mt-2">
                                <LogIn className="w-4 h-4" /> Giriş Yap
                            </button>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};