import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen w-full">
      {/* Main Content */}
      <main className="min-h-screen">
        {children}
      </main>

      {/* Bottom Navigation - only show when user is logged in */}
      {user && <BottomNavigation />}
    </div>
  );
}