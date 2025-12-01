import { NavLink, useLocation } from 'react-router-dom';
import { Home, History, Bell, Search, MessageSquare, Lightbulb, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { useComposerStore } from '@/hooks/useComposerStore';
import { Button } from '@/components/ui/button';
import { ComposerModal } from '@/components/composer/ComposerModal';
import { cn } from '@/lib/utils';

export function BottomNavigation() {
  const { isOpen, openComposer, closeComposer } = useComposerStore();
  const { user } = useAuth();
  const { mode } = useAppMode();
  const location = useLocation();

  const navItems = [
    { to: '/', icon: Home, label: 'Feed' },
    { to: '/open-ideas', icon: Lightbulb, label: 'Ideas' },
    { to: '/my-posts', icon: MessageSquare, label: 'Posts' },
    { to: '/profile', icon: History, label: 'Profile' },
    { to: '/notifications', icon: Bell, label: 'Alerts' },
    { to: '/research', icon: Search, label: 'Search' },
  ];

  if (!user) return null;

  const isDark = mode === 'public';

  return (
    <>
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className={cn(
          "flex items-center gap-1 px-3 py-2 rounded-full",
          "backdrop-blur-xl border",
          "shadow-lg transition-all duration-300",
          isDark 
            ? "bg-background/80 border-white/10" 
            : "bg-white/90 border-black/5"
        )}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl",
                  "transition-all duration-200 relative group",
                  isActive
                    ? isDark
                      ? "bg-white/10 text-white"
                      : "bg-black/5 text-foreground"
                    : isDark
                      ? "text-white/60 hover:text-white hover:bg-white/5"
                      : "text-foreground/60 hover:text-foreground hover:bg-black/5"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <span className={cn(
                    "absolute -bottom-1 left-1/2 -translate-x-1/2",
                    "w-1 h-1 rounded-full",
                    isDark ? "bg-white" : "bg-foreground"
                  )} />
                )}
              </NavLink>
            );
          })}

          <div className={cn(
            "w-px h-8 mx-1",
            isDark ? "bg-white/10" : "bg-black/10"
          )} />

          <Button
            onClick={() => openComposer()}
            size="icon"
            className={cn(
              "w-9 h-9 rounded-full transition-all duration-200",
              isDark
                ? "bg-white/10 hover:bg-white/20 text-white border-white/20"
                : "bg-black/5 hover:bg-black/10 text-foreground border-black/10"
            )}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </nav>

      <ComposerModal isOpen={isOpen} onClose={closeComposer} />
    </>
  );
}
