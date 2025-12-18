import { NavLink, useLocation } from 'react-router-dom';
import { PenTool, Plus, User, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useComposerStore } from '@/hooks/useComposerStore';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ComposerModal } from '@/components/composer/ComposerModal';
import { cn } from '@/lib/utils';

export function BottomNavigation() {
  const { isOpen, openComposer, closeComposer } = useComposerStore();
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isThinkActive = location.pathname === '/' || location.pathname === '/workspace';
  const isDiscussActive = location.pathname === '/discuss' || location.pathname.startsWith('/discuss');
  const isProfileActive = location.pathname === '/profile';
  
  // Route-aware tooltip text for composer button
  const composerTooltip = isThinkActive ? 'Share to Discuss' : 'Create post';

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className={cn(
          "flex items-center gap-2 px-6 py-4 rounded-full",
          "backdrop-blur-xl border shadow-2xl transition-all duration-300",
          "bg-background/80 border-white/10"
        )}>
          {/* Think Link */}
          <NavLink
            to="/"
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-3 rounded-2xl min-w-[80px]",
              "transition-all duration-200 relative group",
              isThinkActive
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <PenTool className="w-6 h-6" />
            <span className="text-xs font-medium">Think</span>
            {isThinkActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </NavLink>

          {/* Centered Composer Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => openComposer()}
                size="icon"
                className={cn(
                  "w-14 h-14 rounded-full transition-all duration-200 mx-2 shadow-xl",
                  "bg-white/15 hover:bg-white/25 text-white border-2 border-white/20 hover:scale-105"
                )}
              >
                <Plus className="w-7 h-7" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{composerTooltip}</p>
            </TooltipContent>
          </Tooltip>

          {/* Discuss Link */}
          <NavLink
            to="/discuss"
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-3 rounded-2xl min-w-[80px]",
              "transition-all duration-200 relative group",
              isDiscussActive
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs font-medium">Discuss</span>
            {isDiscussActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </NavLink>

          {/* Profile Link */}
          <NavLink
            to="/profile"
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-3 rounded-2xl min-w-[80px]",
              "transition-all duration-200 relative group",
              isProfileActive
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Profile</span>
            {isProfileActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </NavLink>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
        <div className={cn(
          "flex items-center justify-around px-4 py-3 rounded-2xl",
          "backdrop-blur-xl border shadow-lg",
          "bg-background/90 border-white/10"
        )}>
          {/* Think */}
          <NavLink
            to="/"
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative",
              isThinkActive ? "text-white" : "text-white/50"
            )}
          >
            <PenTool className="w-6 h-6" />
            {isThinkActive && (
              <span className="w-1 h-1 rounded-full bg-white" />
            )}
          </NavLink>

          {/* Discuss */}
          <NavLink
            to="/discuss"
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative",
              isDiscussActive ? "text-white" : "text-white/50"
            )}
          >
            <MessageCircle className="w-6 h-6" />
            {isDiscussActive && (
              <span className="w-1 h-1 rounded-full bg-white" />
            )}
          </NavLink>

          {/* Centered Composer button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => openComposer()}
                size="icon"
                className={cn(
                  "w-14 h-14 rounded-full transition-all shadow-lg -mt-6",
                  "bg-white/15 hover:bg-white/25 text-white border-2 border-white/20"
                )}
              >
                <Plus className="w-7 h-7" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{composerTooltip}</p>
            </TooltipContent>
          </Tooltip>

          {/* Profile */}
          <NavLink
            to="/profile"
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative",
              isProfileActive ? "text-white" : "text-white/50"
            )}
          >
            <User className="w-6 h-6" />
            {isProfileActive && (
              <span className="w-1 h-1 rounded-full bg-white" />
            )}
          </NavLink>
        </div>
      </nav>

      <ComposerModal isOpen={isOpen} onClose={closeComposer} />
    </>
  );
}
