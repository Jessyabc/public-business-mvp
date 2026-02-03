import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { PenTool, Plus, User, MessageCircle, ChevronUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useComposerStore } from '@/hooks/useComposerStore';
import { useWorkspaceStore } from '@/features/workspace/useWorkspaceStore';
import { useDiscussLensSafe } from '@/contexts/DiscussLensContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useBottomNavSwipe } from '@/hooks/useBottomNavSwipe';
import { useIsMobile } from '@/hooks/use-mobile';
import { useProfilePanelStore } from '@/hooks/useProfilePanelStore';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ComposerModal } from '@/components/composer/ComposerModal';
import { ProfileSlidePanel } from './ProfileSlidePanel';
import { BusinessSlidePanel } from './BusinessSlidePanel';
import { cn } from '@/lib/utils';

// PB Blue for active states on business/light backgrounds
const PB_BLUE = '#4A7C9B';

export function BottomNavigation() {
  const { isOpen, openComposer, closeComposer } = useComposerStore();
  const { createThought, getActiveThought } = useWorkspaceStore();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { lens, toggleLens } = useDiscussLensSafe();
  const { isBusinessMember } = useUserRoles();
  const isMobile = useIsMobile();
  const { isOpen: isProfilePanelOpen, closePanel: closeProfilePanel } = useProfilePanelStore();

  // Swipe navigation (mobile only)
  const {
    activePanel,
    setActivePanel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useBottomNavSwipe({
    isBusinessMember: isBusinessMember(),
    onNavigateBack: () => navigate(-1),
  });

  // Sync swipe panel state with profile panel store (for desktop access)
  const effectiveActivePanel = isMobile ? activePanel : (isProfilePanelOpen ? 'profile' : 'none');

  if (!user) return null;

  const isThinkPage = location.pathname === '/' || location.pathname === '/workspace';
  const isDiscussPage = location.pathname === '/discuss' || location.pathname.startsWith('/discuss');
  const isThinkActive = isThinkPage;
  const isDiscussActive = isDiscussPage;
  const isProfileActive = location.pathname === '/profile';
  
  // Handle Think button click - navigate or open new thought
  const handleThinkClick = () => {
    if (isThinkActive) {
      // Already on Think page - create new thought if none active
      const activeThought = getActiveThought();
      if (!activeThought) {
        createThought(undefined, user?.id);
      }
    } else {
      navigate('/');
    }
  };
  
  // Route-aware tooltip text for composer button
  const composerTooltip = isThinkActive ? 'Share to Discuss' : 'Create post';

  // Determine if we're on a light background
  // Light: Think page, or Discuss with business lens
  const isLightBg = isThinkPage || (isDiscussPage && lens === 'business');
  
  // Glass styling adapts to background
  const glassStyle = isLightBg 
    ? {
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 8px 32px rgba(166, 150, 130, 0.2)'
      }
    : {
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      };

  // Text colors based on background
  const textActive = isLightBg ? PB_BLUE : 'white';
  const textInactive = isLightBg ? '#6B635B' : 'rgba(255,255,255,0.6)';
  const textHover = isLightBg ? '#3D3833' : 'white';

  return (
    <>
      {/* Bottom Navigation - Used everywhere for consistency, swipe gestures mobile-only */}
      <nav 
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
        {...(isMobile ? {
          onTouchStart: handleTouchStart,
          onTouchMove: handleTouchMove,
          onTouchEnd: handleTouchEnd,
        } : {})}
      >
        <div 
          className="flex items-center justify-around px-4 py-3 rounded-2xl transition-all duration-300 relative"
          style={glassStyle}
        >
          {/* Think */}
          <button
            onClick={handleThinkClick}
            className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative"
            style={{ color: isThinkActive ? textActive : textInactive }}
          >
            <PenTool className="w-6 h-6" />
            {isThinkActive && (
              <span 
                className="w-1 h-1 rounded-full"
                style={{ background: textActive }}
              />
            )}
          </button>

          {/* Centered Composer button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => openComposer()}
                size="icon"
                className="w-14 h-14 rounded-full transition-all -mt-6 border-2"
                style={{
                  background: isLightBg ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)',
                  color: isLightBg ? PB_BLUE : 'white',
                  borderColor: isLightBg ? 'rgba(74, 124, 155, 0.3)' : 'rgba(255,255,255,0.2)',
                  boxShadow: isLightBg ? '0 4px 16px rgba(74, 124, 155, 0.25)' : '0 4px 16px rgba(0,0,0,0.3)'
                }}
              >
                <Plus className="w-7 h-7" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{composerTooltip}</p>
            </TooltipContent>
          </Tooltip>

          {/* Discuss */}
          <button
            onClick={() => {
              if (isDiscussActive) {
                toggleLens();
              } else {
                navigate('/discuss');
              }
            }}
            className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative"
            style={{ color: isDiscussActive ? textActive : textInactive }}
          >
            <MessageCircle className="w-6 h-6" />
            {isDiscussActive && (
              <span 
                className="w-1 h-1 rounded-full"
                style={{ background: textActive }}
              />
            )}
          </button>

          {/* Swipe indicator - mobile only */}
          {isMobile && (
            <div 
              className="absolute -top-1 right-4 flex items-center gap-0.5"
              style={{ color: textInactive }}
            >
              <ChevronUp className="w-3 h-3 rotate-90 opacity-60" />
              <span className="text-[10px] opacity-60">swipe</span>
            </div>
          )}
        </div>
      </nav>

      {/* Slide Panels */}
      <ProfileSlidePanel
        isOpen={effectiveActivePanel === 'profile'}
        onClose={() => {
          if (isMobile) {
            setActivePanel('none');
          } else {
            closeProfilePanel();
          }
        }}
        showBusinessHint={isBusinessMember()}
        onSwipeTowardsBusiness={() => {
          if (isMobile) {
            setActivePanel('business');
          }
        }}
      />
      
      <BusinessSlidePanel
        isOpen={activePanel === 'business'}
        onClose={() => setActivePanel('none')}
        onBack={() => setActivePanel('profile')}
      />

      <ComposerModal isOpen={isOpen} onClose={closeComposer} />
    </>
  );
}
