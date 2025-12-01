import { NavLink, useLocation } from 'react-router-dom';
import { Home, Lightbulb, MessageSquare, Plus, Menu, X, Bell, Search, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { useComposerStore } from '@/hooks/useComposerStore';
import { Button } from '@/components/ui/button';
import { ComposerModal } from '@/components/composer/ComposerModal';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function BottomNavigation() {
  const { isOpen, openComposer, closeComposer } = useComposerStore();
  const { user } = useAuth();
  const { mode } = useAppMode();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const primaryItems = [
    { to: '/', icon: Home, label: 'Feed' },
    { to: '/open-ideas', icon: Lightbulb, label: 'Ideas' },
    { to: '/my-posts', icon: MessageSquare, label: 'Posts' },
  ];

  const secondaryItems = [
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/notifications', icon: Bell, label: 'Alerts' },
    { to: '/research', icon: Search, label: 'Search' },
  ];

  if (!user) return null;

  const isDark = mode === 'public';

  return (
    <>
      {/* Desktop Navigation - Full width with all items */}
      <nav className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className={cn(
          "flex items-center gap-1 px-3 py-2 rounded-full",
          "backdrop-blur-xl border shadow-lg transition-all duration-300",
          isDark 
            ? "bg-background/80 border-white/10" 
            : "bg-white/90 border-black/5"
        )}>
          {[...primaryItems, ...secondaryItems].map((item) => {
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
                    "absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
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

      {/* Mobile Navigation - Compact with menu */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
        <div className={cn(
          "flex items-center justify-around px-4 py-3 rounded-2xl",
          "backdrop-blur-xl border shadow-lg",
          isDark 
            ? "bg-background/90 border-white/10" 
            : "bg-white/95 border-black/5"
        )}>
          {/* Primary nav items - icons only on mobile */}
          {primaryItems.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative",
                  isActive
                    ? isDark
                      ? "text-white"
                      : "text-foreground"
                    : isDark
                      ? "text-white/50"
                      : "text-foreground/50"
                )}
              >
                <Icon className="w-6 h-6" />
                {isActive && (
                  <span className={cn(
                    "w-1 h-1 rounded-full",
                    isDark ? "bg-white" : "bg-foreground"
                  )} />
                )}
              </NavLink>
            );
          })}

          {/* Menu trigger for secondary items */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "p-2 rounded-xl transition-all",
                  isDark
                    ? "text-white/60 hover:text-white hover:bg-white/5"
                    : "text-foreground/60 hover:text-foreground hover:bg-black/5"
                )}
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="bottom" 
              className={cn(
                "rounded-t-3xl p-6 border-t",
                isDark
                  ? "bg-background/95 backdrop-blur-xl border-white/10"
                  : "bg-white/95 backdrop-blur-xl border-black/10"
              )}
            >
              <div className="space-y-2">
                <h3 className="text-sm font-medium mb-4 opacity-60">More Options</h3>
                {secondaryItems.map((item) => {
                  const isActive = location.pathname === item.to;
                  const Icon = item.icon;
                  
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                        isActive
                          ? isDark
                            ? "bg-white/10 text-white"
                            : "bg-black/5 text-foreground"
                          : isDark
                            ? "text-white/70 hover:bg-white/5"
                            : "text-foreground/70 hover:bg-black/5"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>

          {/* Composer button */}
          <Button
            onClick={() => openComposer()}
            size="icon"
            className={cn(
              "w-11 h-11 rounded-full transition-all shadow-lg",
              isDark
                ? "bg-white/15 hover:bg-white/25 text-white border border-white/20"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </nav>

      <ComposerModal isOpen={isOpen} onClose={closeComposer} />
    </>
  );
}
