import { useAppMode } from '@/contexts/AppModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { GlobalNavigationMenu } from '@/components/navigation/GlobalNavigationMenu';
import FlowView from '@/components/FlowView';

export default function Brainstorm() {
  const { mode } = useAppMode();
  const { user } = useAuth();

  return (
    <div className={`min-h-screen w-full transition-all duration-700 ease-in-out relative ${
      mode === 'public' 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Global Navigation Menu - always visible */}
      <GlobalNavigationMenu />
      
      {/* Header - inside the brainstorm view when user is not logged in */}
      {!user && (
        <div className="absolute top-0 left-0 right-0 z-40">
          <Header />
        </div>
      )}
      
      {/* Full Screen Brainstorm Map */}
      <div className={`w-full h-screen ${!user ? 'pt-20' : ''}`}>
        <FlowView />
      </div>

      {/* Footer - inside the brainstorm view when user is not logged in */}
      {!user && (
        <div className="absolute bottom-0 left-0 right-0 z-40">
          <Footer />
        </div>
      )}

      {/* Bottom Navigation - inside the brainstorm view when user is logged in */}
      {user && (
        <div className="absolute bottom-0 left-0 right-0 z-40">
          <BottomNavigation />
        </div>
      )}
    </div>
  );
}