import { ReactNode, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { GlobalNavigationMenu } from '@/components/navigation/GlobalNavigationMenu';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { GlobalBackground } from '@/components/layout/GlobalBackground';
import { SwipeNavigationWrapper } from '@/components/layout/SwipeNavigationWrapper';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
interface MainLayoutProps {
  children: ReactNode;
  noTopPadding?: boolean;
}
export function MainLayout({
  children,
  noTopPadding = false
}: MainLayoutProps) {
  const {
    user
  } = useAuth();
  const location = useLocation();
  const prevPathnameRef = useRef<string>(location.pathname);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Determine if we're navigating to/from open-ideas for horizontal slide
  const isOpenIdeasRoute = location.pathname.startsWith('/open-ideas');
  const wasOpenIdeasRoute = prevPathnameRef.current.startsWith('/open-ideas');
  const useHorizontalSlide = isOpenIdeasRoute || wasOpenIdeasRoute;

  // Update previous pathname
  useEffect(() => {
    prevPathnameRef.current = location.pathname;
  }, [location.pathname]);

  // Determine slide direction (simplified: slide from right when entering, left when leaving)
  const slideDirection = isOpenIdeasRoute ? 100 : -100;
  return <div className="relative min-h-screen w-full bg-transparent" style={{
    color: 'var(--text-primary)'
  }}>
      <GlobalBackground />
      
      {/* Global Navigation Menu - always visible */}
      <GlobalNavigationMenu />
      
      {/* Header - only show when user is not logged in */}
      {!user && <Header className="bg-[#65758c]/65" />}
      
      {/* Main Content with smooth transitions - ensure it's above background */}
      <main className={`relative z-10 ${user ? "min-h-screen pt-16" : noTopPadding ? "min-h-screen" : "min-h-screen pt-24"}`}>
        <SwipeNavigationWrapper>
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{
            opacity: 0,
            ...(useHorizontalSlide ? {
              x: slideDirection
            } : {
              y: 20
            })
          }} animate={{
            opacity: 1,
            ...(useHorizontalSlide ? {
              x: 0
            } : {
              y: 0
            })
          }} exit={{
            opacity: 0,
            ...(useHorizontalSlide ? {
              x: -slideDirection
            } : {
              y: -20
            })
          }} transition={{
            duration: 0.35,
            ease: [0.4, 0, 0.2, 1]
          }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </SwipeNavigationWrapper>
      </main>

      {/* Footer - only show when user is not logged in */}
      {!user && <Footer />}

      {/* Bottom Navigation - only show when user is logged in */}
      {user && <BottomNavigation />}
    </div>;
}