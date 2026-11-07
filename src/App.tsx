import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { CompetitionsView } from './components/CompetitionsView';
import { AdminPanelView } from './components/AdminPanelView';
import { CommunityView } from './components/CommunityView';
import { ForumView } from './components/ForumView';
import { ProfileModal } from './components/ProfileModal'; // YENİ EKLENDİ
import { supabase } from './supabaseClient';
import type { UserProfile } from './utils/types';

function App() {
  const [activeTab, setActiveTab] = useState<'competitions' | 'forum' | 'community'>('competitions');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // YENİ EKLENDİ
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Admin paneli açık mı?
  const [isAdminView, setIsAdminView] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setIsLoadingSession(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, email: string | undefined) => {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (profile) {
      setCurrentUser({
        id: profile.id,
        name: profile.name,
        email: profile.email || email || '',
        role: profile.role,
        teamName: profile.team_name,
        institution: profile.institution,
        bio: profile.bio,
        skills: profile.skills,
      });
    }
    setIsLoadingSession(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setIsAdminView(false); // Çıkış yapınca admin panelini de kapat
  };

  if (isLoadingSession) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Yükleniyor...</div>;
  }

  // Eğer Admin Paneli açıksa, sadece onu göster
  if (isAdminView) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminPanelView
          onBackToSite={() => setIsAdminView(false)}
          currentUser={currentUser} // <-- SADECE BURAYI EKLE
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLoginClick={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onProfileClick={() => setIsProfileModalOpen(true)} // YENİ EKLENDİ
      />

      <main>
        {activeTab === 'competitions' && (
          <CompetitionsView
            currentUser={currentUser}
            onOpenAdminPanel={() => setIsAdminView(true)}
          />
        )}
        {activeTab === 'forum' && (
          <ForumView currentUser={currentUser} />
        )}
        {activeTab === 'community' && (
          <CommunityView currentUser={currentUser} />
        )}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={(user) => setCurrentUser(user)}
      />

      {/* YENİ EKLENEN PROFİL MODALI */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdate={() => {
          // Profil güncellendiğinde sayfayı yenile (en basit yöntem)
          window.location.reload();
        }}
      />
    </div>
  );
}

export default App;