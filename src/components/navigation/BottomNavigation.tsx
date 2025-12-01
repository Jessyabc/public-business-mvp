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

  const leftItems = [
    { to: '/', icon: Home, label: 'Feed' },
    { to: '/open-ideas', icon: Lightbulb, label: 'Ideas' },
    { to: '/my-posts', icon: MessageSquare, label: 'Posts' },
  ];

  const rightItems = [
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/notifications', icon: Bell, label: 'Alerts' },
    { to: '/research', icon: Search, label: 'Search' },
  ];

  if (!user) return null;

  const isDark = mode === 'public';

  return (
    <>
      {/* Desktop Navigation - Large with centered composer */}
      <nav className="hidden md:block fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className={cn(
          "flex items-center gap-2 px-6 py-4 rounded-full",
          "backdrop-blur-xl border shadow-2xl transition-all duration-300",
          isDark 
            ? "bg-background/80 border-white/10" 
            : "bg-white/90 border-black/5"
        )}>
          {/* Left items */}
          {leftItems.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-3 rounded-2xl min-w-[80px]",
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
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <span className={cn(
                    "absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full",
                    isDark ? "bg-white" : "bg-foreground"
                  )} />
                )}
              </NavLink>
            );
          })}

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

          {/* Right items */}
          {rightItems.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-3 rounded-2xl min-w-[80px]",
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
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <span className={cn(
                    "absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full",
                    isDark ? "bg-white" : "bg-foreground"
                  )} />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Mobile Navigation - Compact with centered composer */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
        <div className={cn(
          "flex items-center justify-around px-4 py-3 rounded-2xl",
          "backdrop-blur-xl border shadow-lg",
          isDark 
            ? "bg-background/90 border-white/10" 
            : "bg-white/95 border-black/5"
        )}>
          {/* Left items */}
          {leftItems.slice(0, 2).map((item) => {
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

          {/* Centered Composer button */}
          <Button
            onClick={() => openComposer()}
            size="icon"
            className={cn(
              "w-12 h-12 rounded-full transition-all shadow-lg -mt-8",
              isDark
                ? "bg-white/15 hover:bg-white/25 text-white border-2 border-white/20"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
          >
            <Plus className="w-6 h-6" />
          </Button>

          {/* Right side - My Posts */}
          <NavLink
            to="/my-posts"
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative",
              location.pathname === '/my-posts'
                ? isDark
                  ? "text-white"
                  : "text-foreground"
                : isDark
                  ? "text-white/50"
                  : "text-foreground/50"
            )}
          >
            <MessageSquare className="w-6 h-6" />
            {location.pathname === '/my-posts' && (
              <span className={cn(
                "w-1 h-1 rounded-full",
                isDark ? "bg-white" : "bg-foreground"
              )} />
            )}
          </NavLink>

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
                {rightItems.map((item) => {
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
        </div>
      </nav>

      <ComposerModal isOpen={isOpen} onClose={closeComposer} />
    </>
  );
}
