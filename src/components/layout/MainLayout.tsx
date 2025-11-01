import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { GlobalNavigationMenu } from '@/components/navigation/GlobalNavigationMenu';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { GlobalBackground } from '@/components/layout/GlobalBackground';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

interface MainLayoutProps {
  children: ReactNode;
  noTopPadding?: boolean;
}

export function MainLayout({ children, noTopPadding = false }: MainLayoutProps) {
  const { user } = useAuth();
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div 
      className="relative min-h-screen w-full bg-transparent"
      style={{ color: 'var(--text-primary)' }}
    >
      <GlobalBackground />
      
      {/* Global Navigation Menu - always visible */}
      <GlobalNavigationMenu />
      
      {/* Header - only show when user is not logged in */}
      {!user && <Header />}
      
      {/* Main Content with smooth transitions */}
      <main className={user ? "min-h-screen pt-16" : noTopPadding ? "min-h-screen" : "min-h-screen pt-24"}>
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