import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { CompetitionsView } from './components/CompetitionsView';
import { AdminPanelView } from './components/AdminPanelView';
import { CommunityView } from './components/CommunityView';
import { ForumView } from './components/ForumView';
import { ProfileModal } from './components/ProfileModal';
import { supabase } from './supabaseClient';
import type { UserProfile } from './utils/types';

function App() {
  const [activeTab, setActiveTab] = useState<'competitions' | 'forum' | 'community'>('competitions');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isAdminView, setIsAdminView] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchProfile(session.user.id, session.user.email);
      else setIsLoadingSession(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) fetchProfile(session.user.id, session.user.email);
      else setCurrentUser(null);
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
        avatarUrl: profile.avatar_url, // <-- BURAYI EKLEDİK
      });
    }
    setIsLoadingSession(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setIsAdminView(false);
  };

  if (isLoadingSession) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Yükleniyor...</div>;

  if (isAdminView) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminPanelView onBackToSite={() => setIsAdminView(false)} currentUser={currentUser} />
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
        onProfileClick={() => setIsProfileModalOpen(true)}
        onOpenAdminPanel={() => setIsAdminView(true)}
      />

      <main>
        {activeTab === 'competitions' && <CompetitionsView currentUser={currentUser} />}
        {activeTab === 'forum' && <ForumView currentUser={currentUser} />}
        {activeTab === 'community' && <CommunityView currentUser={currentUser} />}
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLogin={(user) => setCurrentUser(user)} />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdate={async () => {
          // Profil kaydedildiğinde kullanıcı verisini Supabase'den tekrar çek
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await fetchProfile(session.user.id, session.user.email);
          }
        }}
      />
    </div>
  );
}

export default App;