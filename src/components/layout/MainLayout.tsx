import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { GlobalNavigationMenu } from '@/components/navigation/GlobalNavigationMenu';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user } = useAuth();
  const { mode } = useAppMode();
  const location = useLocation();

  return (
    <div className={`min-h-screen w-full transition-all duration-700 ease-in-out ${
      mode === 'public' 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Global Navigation Menu - always visible */}
      <GlobalNavigationMenu />
      
      {/* Header - only show when user is not logged in */}
      {!user && <Header />}
      
      {/* Main Content with smooth transitions */}
      <main className={user ? "min-h-screen" : "min-h-screen pt-28"}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer - only show when user is not logged in */}
      {!user && <Footer />}

      {/* Bottom Navigation - only show when user is logged in */}
      {user && <BottomNavigation />}
    </div>
  );
}