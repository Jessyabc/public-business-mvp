import { NavLink, useLocation } from 'react-router-dom';
import { PenTool, Plus, User } from 'lucide-react';
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
    { to: '/', icon: PenTool, label: 'Workspace' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  if (!user) return null;

  const isDark = mode === 'public';

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className={cn(
          "flex items-center gap-2 px-6 py-4 rounded-full",
          "backdrop-blur-xl border shadow-2xl transition-all duration-300",
          isDark 
            ? "bg-background/80 border-white/10" 
            : "bg-white/90 border-black/5"
        )}>
          {/* Workspace Link */}
          <NavLink
            to="/"
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-3 rounded-2xl min-w-[80px]",
              "transition-all duration-200 relative group",
              location.pathname === '/'
                ? isDark
                  ? "bg-white/10 text-white"
                  : "bg-black/5 text-foreground"
                : isDark
                  ? "text-white/60 hover:text-white hover:bg-white/5"
                  : "text-foreground/60 hover:text-foreground hover:bg-black/5"
            )}
          >
            <PenTool className="w-6 h-6" />
            <span className="text-xs font-medium">Workspace</span>
            {location.pathname === '/' && (
              <span className={cn(
                "absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full",
                isDark ? "bg-white" : "bg-foreground"
              )} />
            )}
          </NavLink>

          {/* Centered Composer Button */}
          <Button
            onClick={() => openComposer()}
            size="icon"
            className={cn(
              "w-14 h-14 rounded-full transition-all duration-200 mx-2 shadow-xl",
              isDark
                ? "bg-white/15 hover:bg-white/25 text-white border-2 border-white/20 hover:scale-105"
                : "bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105"
            )}
          >
            <Plus className="w-7 h-7" />
          </Button>

          {/* Profile Link */}
          <NavLink
            to="/profile"
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-3 rounded-2xl min-w-[80px]",
              "transition-all duration-200 relative group",
              location.pathname === '/profile'
                ? isDark
                  ? "bg-white/10 text-white"
                  : "bg-black/5 text-foreground"
                : isDark
                  ? "text-white/60 hover:text-white hover:bg-white/5"
                  : "text-foreground/60 hover:text-foreground hover:bg-black/5"
            )}
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Profile</span>
            {location.pathname === '/profile' && (
              <span className={cn(
                "absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full",
                isDark ? "bg-white" : "bg-foreground"
              )} />
            )}
          </NavLink>
        </div>
      </nav>

      {/* Mobile Navigation - Simplified */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
        <div className={cn(
          "flex items-center justify-around px-4 py-3 rounded-2xl",
          "backdrop-blur-xl border shadow-lg",
          isDark 
            ? "bg-background/90 border-white/10" 
            : "bg-white/95 border-black/5"
        )}>
          {/* Workspace */}
          <NavLink
            to="/"
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative",
              location.pathname === '/'
                ? isDark ? "text-white" : "text-foreground"
                : isDark ? "text-white/50" : "text-foreground/50"
            )}
          >
            <PenTool className="w-6 h-6" />
            {location.pathname === '/' && (
              <span className={cn("w-1 h-1 rounded-full", isDark ? "bg-white" : "bg-foreground")} />
            )}
          </NavLink>

          {/* Centered Composer button */}
          <Button
            onClick={() => openComposer()}
            size="icon"
            className={cn(
              "w-14 h-14 rounded-full transition-all shadow-lg -mt-6",
              isDark
                ? "bg-white/15 hover:bg-white/25 text-white border-2 border-white/20"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
          >
            <Plus className="w-7 h-7" />
          </Button>

          {/* Profile */}
          <NavLink
            to="/profile"
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative",
              location.pathname === '/profile'
                ? isDark ? "text-white" : "text-foreground"
                : isDark ? "text-white/50" : "text-foreground/50"
            )}
          >
            <User className="w-6 h-6" />
            {location.pathname === '/profile' && (
              <span className={cn("w-1 h-1 rounded-full", isDark ? "bg-white" : "bg-foreground")} />
            )}
          </NavLink>
        </div>
      </nav>

      <ComposerModal isOpen={isOpen} onClose={closeComposer} />
    </>
  );
}
