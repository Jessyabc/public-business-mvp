import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAppMode } from '@/contexts/AppModeContext';
import { Button } from '@/components/ui/button';
import { ToggleLeft, User, Settings, LogOut, Shield, UserCheck, Brain, Building2, Search, Plus, Palette } from 'lucide-react';
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

export function GlobalNavigationMenu() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { isBusinessMember, isAdmin } = useUserRoles();
  const { mode, toggleMode } = useAppMode();
  const { openComposer } = useComposerStore();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  if (!user) {
    return null; // Don't render anything when user is not logged in - use Header component instead
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 py-2 sm:py-3 backdrop-blur-xl border-b ${
      mode === 'public' 
        ? 'bg-black/20 border-white/10' 
        : 'bg-white/70 border-slate-300/40'
    }`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <Brain className={`w-6 h-6 sm:w-8 sm:h-8 ${mode === 'public' ? 'text-primary' : 'text-blue-600'}`} />
            <span className={`text-base sm:text-xl font-bold hidden xs:inline ${mode === 'public' ? 'text-white' : 'text-slate-800'}`}>
              PublicBusiness
            </span>
          </div>
          
          {/* Mode indicator */}
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border ${
            mode === 'public' 
              ? 'bg-primary/20 border-primary/30 text-primary' 
              : 'bg-blue-600/20 border-blue-600/30 text-blue-600'
          }`}>
            {mode === 'public' ? (
              <>
                <Brain className="w-4 h-4" />
                <span className="text-sm font-medium">Public Mode</span>
              </>
            ) : (
              <>
                <Building2 className="w-4 h-4" />
                <span className="text-sm font-medium">Business Mode</span>
              </>
            )}
          </div>
        </div>

        {/* Right side - Actions and Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mode Toggle */}
          <Button
            onClick={toggleMode}
            variant="ghost"
            size="sm"
            className={`flex items-center gap-2 px-2 sm:px-3 ${
              mode === 'public' 
                ? 'text-white hover:bg-white/10' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ToggleLeft className="w-4 h-4" />
            <span className="hidden md:inline">Switch to {mode === 'public' ? 'Business' : 'Public'}</span>
          </Button>

          {/* Create Content Button */}
          <Button
            onClick={handleCreateContent}
            size="sm"
            className={`px-2 sm:px-4 ${
              mode === 'public'
                ? 'bg-primary hover:bg-primary/90 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Create</span>
          </Button>

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={`relative h-8 w-8 rounded-full ${
                  mode === 'public' ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.display_name || 'User'} />
                  <AvatarFallback className={
                    mode === 'public' 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-blue-600/20 text-blue-600'
                  }>
                    {profile?.display_name?.[0] || user?.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-56 bg-popover/95 backdrop-blur-md border-border shadow-lg" 
              align="end" 
              forceMount
              side="bottom"
              sideOffset={8}
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.display_name || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Role indicators */}
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
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => navigate('/customize')}>
                <Palette className="mr-2 h-4 w-4" />
                <span>Customize Theme</span>
              </DropdownMenuItem>
              
              {isAdmin() && (
                <DropdownMenuItem onClick={() => navigate('/admin')}>
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleSignOut}>
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