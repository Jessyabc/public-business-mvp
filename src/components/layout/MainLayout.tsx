import { ReactNode } from 'react';
import { useAppMode } from '@/contexts/AppModeContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { ModeToggle } from '@/components/ModeToggle';
import { UserProfile } from '@/components/auth/UserProfile';
import { Menu } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { mode } = useAppMode();

  return (
    <SidebarProvider>
      <div className={`min-h-screen w-full transition-all duration-500 ${
        mode === 'public' 
          ? 'bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900' 
          : 'bg-gradient-to-br from-slate-800 via-slate-700/30 to-slate-800'
      }`}>
        {/* Header */}
        <header className={`h-16 border-b backdrop-blur-xl ${
          mode === 'public' 
            ? 'bg-slate-900/50 border-blue-500/20' 
            : 'bg-slate-800/50 border-slate-500/20'
        }`}>
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex items-center space-x-4">
              <SidebarTrigger className={`${
                mode === 'public' ? 'text-blue-400 hover:text-blue-300' : 'text-slate-300 hover:text-slate-200'
              } transition-colors`}>
                <Menu className="w-5 h-5" />
              </SidebarTrigger>
              
              <div className="flex items-center space-x-3">
                <div className={`text-xl font-bold ${
                  mode === 'public' ? 'text-blue-400' : 'text-slate-300'
                }`}>
                  Public Business
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  mode === 'public' 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                    : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                }`}>
                  Beta
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <ModeToggle />
              <UserProfile />
            </div>
          </div>
        </header>

        <div className="flex w-full">
          <AppSidebar />
          
          <main className="flex-1 min-h-[calc(100vh-4rem)] overflow-auto">
            <div className={`transition-all duration-500 ${
              mode === 'public' 
                ? 'text-blue-50' 
                : 'text-slate-100'
            }`}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}