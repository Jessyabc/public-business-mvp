import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useDiscussLensSafe } from '@/contexts/DiscussLensContext';
import { Button } from '@/components/ui/button';
import { User, Settings, LogOut, Shield, UserCheck, Brain, Building2, Plus, Palette, Map, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { useComposerStore } from '@/hooks/useComposerStore';
import { useUserOrgId } from '@/features/orgs/hooks/useUserOrgId';

// PB Blue for accents on light backgrounds
const PB_BLUE = '#4A7C9B';

export function GlobalNavigationMenu() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { isBusinessMember, isAdmin } = useUserRoles();
  const { openComposer } = useComposerStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { data: orgId } = useUserOrgId();
  const { lens } = useDiscussLensSafe();

  // PB requirement: lens/role UI should not appear in Think (/); keep it scoped to Discuss.
  const showDiscussOnlyUi = location.pathname.startsWith('/discuss');

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error: unknown) {
      console.error('Failed to sign out', error);
      let description = 'Failed to sign out';
      if (error instanceof Error) {
        description = error.message;
      } else if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        description = (error as { message: string }).message;
      }
      toast({
        title: "Error",
        description,
        variant: "destructive",
      });
    }
  };

  const handleCreateContent = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    openComposer({});
  };

  // Detect if we're on a light background
  const isThinkPage = location.pathname === '/' || location.pathname === '/workspace';
  const isDiscussPage = location.pathname.startsWith('/discuss');
  const isLightBg = isThinkPage || (isDiscussPage && lens === 'business');

  // Glass styling adapts to background
  const glassStyle = isLightBg 
    ? {
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 2px 16px rgba(166, 150, 130, 0.15)'
      }
    : {
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 2px 16px rgba(0, 0, 0, 0.2)'
      };

  if (!user) {
    return null;
  }

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 py-2 sm:py-3 transition-all duration-300"
      style={glassStyle}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left side - Logo */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <Brain 
              className="w-6 h-6 sm:w-8 sm:h-8"
              style={{ color: isLightBg ? PB_BLUE : 'var(--primary)' }}
            />
            <span 
              className="text-base sm:text-xl font-bold hidden xs:inline"
              style={{ color: isLightBg ? '#3D3833' : 'white' }}
            >
              PublicBusiness
            </span>
          </div>
        </div>

        {/* Right side - Actions and Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Create Content Button */}
          <Button
            onClick={handleCreateContent}
            size="sm"
            className="px-2 sm:px-4 transition-all duration-200"
            style={isLightBg ? {
              background: 'rgba(255,255,255,0.8)',
              color: PB_BLUE,
              border: `1px solid rgba(74, 124, 155, 0.3)`,
              boxShadow: '0 2px 8px rgba(74, 124, 155, 0.15)'
            } : {
              background: 'var(--primary)',
              color: 'white'
            }}
          >
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Create</span>
          </Button>

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-8 w-8 rounded-full"
                style={{ 
                  background: 'transparent'
                }}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.display_name || 'User'} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {profile?.display_name?.[0] || user?.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className={cn(
                "w-56 backdrop-blur-md border-border shadow-lg",
                isLightBg 
                  ? "bg-white/95 text-[#3A3530] border-[#D4CEC5]" 
                  : "bg-popover/95 text-popover-foreground"
              )} 
              align="end" 
              forceMount
              side="bottom"
              sideOffset={8}
            >
              <DropdownMenuLabel className={cn("font-normal", isLightBg && "text-[#3A3530]")}>
                <div className="flex flex-col space-y-1">
                  <p className={cn("text-sm font-medium leading-none", isLightBg ? "text-[#3A3530]" : "")}>
                    {profile?.display_name || 'User'}
                  </p>
                  <p className={cn("text-xs leading-none", isLightBg ? "text-[#6B635B]" : "text-muted-foreground")}>
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className={isLightBg ? "bg-[#D4CEC5]" : ""} />
              
              {/* Role indicators */}
              {showDiscussOnlyUi && (
                <div className="px-2 py-1.5">
                  <div className="flex flex-wrap gap-1">
                    {isAdmin() && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                        <Shield className="w-3 h-3" />
                        Admin
                      </span>
                    )}
                    {isBusinessMember() && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                        <Building2 className="w-3 h-3" />
                        Business
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                      <UserCheck className="w-3 h-3" />
                      Public
                    </span>
                  </div>
                </div>
              )}
              
              <DropdownMenuSeparator className={isLightBg ? "bg-[#D4CEC5]" : ""} />
              
              <DropdownMenuItem 
                onClick={() => navigate('/profile')}
                className={isLightBg ? "text-[#3A3530] focus:bg-[#F5F1ED] focus:text-[#3A3530]" : ""}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => navigate('/discuss')}
                className={isLightBg ? "text-[#3A3530] focus:bg-[#F5F1ED] focus:text-[#3A3530]" : ""}
              >
                <Brain className="mr-2 h-4 w-4" />
                <span>Discuss</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => navigate('/research')}
                className={isLightBg ? "text-[#3A3530] focus:bg-[#F5F1ED] focus:text-[#3A3530]" : ""}
              >
                <Search className="mr-2 h-4 w-4" />
                <span>Research Hub</span>
              </DropdownMenuItem>
              
              {isBusinessMember() && (
                <>
                  <DropdownMenuSeparator className={isLightBg ? "bg-[#D4CEC5]" : ""} />
                  <DropdownMenuItem 
                    onClick={() => navigate('/business-dashboard')}
                    className={isLightBg ? "text-[#3A3530] focus:bg-[#F5F1ED] focus:text-[#3A3530]" : ""}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    <span>Business Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/business-settings')}
                    className={isLightBg ? "text-[#3A3530] focus:bg-[#F5F1ED] focus:text-[#3A3530]" : ""}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Business Settings</span>
                  </DropdownMenuItem>
                </>
              )}
              
              {!orgId && (
                <DropdownMenuItem 
                  onClick={() => navigate('/org/new')}
                  className={isLightBg ? "text-[#3A3530] focus:bg-[#F5F1ED] focus:text-[#3A3530]" : ""}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  <span>Create Organization</span>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator className={isLightBg ? "bg-[#D4CEC5]" : ""} />
              
              <DropdownMenuItem 
                onClick={() => navigate('/settings')}
                className={isLightBg ? "text-[#3A3530] focus:bg-[#F5F1ED] focus:text-[#3A3530]" : ""}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => navigate('/customize')}
                className={isLightBg ? "text-[#3A3530] focus:bg-[#F5F1ED] focus:text-[#3A3530]" : ""}
              >
                <Palette className="mr-2 h-4 w-4" />
                <span>Customize Theme</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => navigate('/sitemap')}
                className={isLightBg ? "text-[#3A3530] focus:bg-[#F5F1ED] focus:text-[#3A3530]" : ""}
              >
                <Map className="mr-2 h-4 w-4" />
                <span>Sitemap</span>
              </DropdownMenuItem>
              
              {isAdmin() && (
                <DropdownMenuItem 
                  onClick={() => navigate('/admin')}
                  className={isLightBg ? "text-[#3A3530] focus:bg-[#F5F1ED] focus:text-[#3A3530]" : ""}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator className={isLightBg ? "bg-[#D4CEC5]" : ""} />
              
              <DropdownMenuItem 
                onClick={handleSignOut}
                className={isLightBg ? "text-[#3A3530] focus:bg-[#F5F1ED] focus:text-[#3A3530]" : ""}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
