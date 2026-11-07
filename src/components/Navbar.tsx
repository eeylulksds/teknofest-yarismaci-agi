import React, { useState } from 'react';
import { Trophy, MessageSquare, Users, LogIn, LogOut, ChevronDown, User } from 'lucide-react';
import type { UserProfile } from '../utils/types';

interface NavbarProps {
    activeTab: 'competitions' | 'forum' | 'community';
    setActiveTab: (tab: 'competitions' | 'forum' | 'community') => void;
    onLoginClick: () => void;
    currentUser: UserProfile | null;
    onLogout: () => void;
    onProfileClick: () => void; // YENİ EKLENDİ
}

export const Navbar: React.FC<NavbarProps> = ({
    activeTab,
    setActiveTab,
    onLoginClick,
    currentUser,
    onLogout,
    onProfileClick // YENİ EKLENDİ
}) => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo ve Başlık */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('competitions')}>
                        <img
                            src="/teknofest-logo.png"
                            alt="TEKNOFEST"
                            className="h-10 w-auto object-contain"
                        />
                        <div className="flex flex-col">
                            <span className="font-extrabold text-lg text-slate-900 leading-tight">TEKNOFEST Yarışmacı Ağı</span>
                        </div>
                    </div>

                    {/* Orta Menü Sekmeleri */}
                    <nav className="hidden md:flex items-center space-x-2">
                        <button
                            onClick={() => setActiveTab('competitions')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'competitions' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <Trophy className="w-4 h-4" />
                            <span>Yarışmalar</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('forum')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'forum' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span>Forum</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('community')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'community' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <Users className="w-4 h-4" />
                            <span>Topluluk</span>
                        </button>
                    </nav>

                    {/* Sağ Taraf */}
                    <div className="flex items-center space-x-3">
                        <a
                            href="https://teknofest.org"
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-semibold text-slate-600 hover:text-red-600 hidden sm:block"
                        >
                            teknofest.org
                        </a>

                        {currentUser ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors"
                                >
                                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                        {currentUser.name?.[0].toUpperCase()}
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700">{currentUser.name}</span>
                                    <ChevronDown className="w-4 h-4 text-slate-500" />
                                </button>

                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-slate-200 shadow-lg py-1">
                                        <div className="px-4 py-2 border-b border-slate-100">
                                            <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                                            <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                                            <span className="mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                                                {currentUser.role === 'yonetici' ? 'Yönetici' : 'Yarışmacı'}
                                            </span>
                                        </div>

                                        {/* YENİ EKLENEN PROFİL BUTONU */}
                                        <button
                                            onClick={() => { setIsUserMenuOpen(false); onProfileClick(); }}
                                            className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                        >
                                            <User className="w-3.5 h-3.5 text-sky-600" />
                                            Profilim
                                        </button>

                                        <button
                                            onClick={() => { setIsUserMenuOpen(false); onLogout(); }}
                                            className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                            <LogOut className="w-3.5 h-3.5" />
                                            Oturumu Kapat
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={onLoginClick}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full text-sm font-bold transition-colors shadow-sm"
                            >
                                <LogIn className="w-4 h-4" />
                                Giriş Yap
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </header>
    );
};