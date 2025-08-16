import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAppMode } from '@/contexts/AppModeContext';
import { Menu, X, LogOut, User, Settings, Home, History, Bell, Search, MessageSquare, Building2, Users, Compass, FileText, Shield, Plus } from 'lucide-react';
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

export function GlobalNavigationMenu() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { isBusinessMember, isAdmin } = useUserRoles();
  const { mode } = useAppMode();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const getMenuItems = () => {
    const baseItems = [
      { icon: Home, to: '/', label: 'Home' },
      { icon: Compass, to: '/about', label: 'About' },
      { icon: Search, to: '/features', label: 'Features' },
      { icon: MessageSquare, to: '/contact', label: 'Contact' },
    ];

    if (user) {
      const loggedInItems = [
        { icon: Home, to: '/', label: 'Feed' },
        { icon: History, to: '/history', label: 'Profile & History' },
        { icon: FileText, to: '/my-posts', label: 'My Posts' },
        { icon: Bell, to: '/notifications', label: 'Notifications' },
        { icon: Search, to: '/research', label: 'Research' },
        { icon: Compass, to: '/explore', label: 'Explore' },
        { icon: Users, to: '/community', label: 'Community' },
        { icon: MessageSquare, to: '/beta-feedback', label: 'Beta Feedback' },
        { icon: Shield, to: '/security', label: 'Security' },
        { icon: User, to: '/profile', label: 'Profile' },
        { icon: Settings, to: '/settings', label: 'Settings' },
      ];

      // Add business-specific items
      if (isBusinessMember() || isAdmin()) {
        loggedInItems.push(
          { icon: Building2, to: '/business-dashboard', label: 'Business Dashboard' },
          { icon: Building2, to: '/business-membership', label: 'Business Membership' },
          { icon: Users, to: '/business-members', label: 'Business Members' }
        );
      }

      // Add members pages
      loggedInItems.push(
        { icon: Users, to: '/all-members', label: 'All Members' },
        { icon: Users, to: '/public-members', label: 'Public Members' }
      );

      return loggedInItems;
    }

    return [
      ...baseItems,
      { icon: Users, to: '/public-members', label: 'Public Members' },
      { icon: Building2, to: '/business-members', label: 'Business Members' },
    ];
  };

  return (
    <div className="fixed top-6 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline" 
            size="icon"
            className={`w-12 h-12 rounded-full backdrop-blur-xl transition-all duration-300 shadow-lg hover:scale-105 ${
              mode === 'public'
                ? 'bg-black/20 border-white/20 text-white hover:bg-white/10'
                : 'bg-white/40 border-blue-200/30 text-slate-600 hover:bg-white/60'
            }`}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className={`w-72 mr-4 backdrop-blur-xl border shadow-xl ${
            mode === 'public'
              ? 'bg-slate-900/90 border-white/20'
              : 'bg-white/90 border-blue-200/30'
          }`} 
          align="end"
        >
          <DropdownMenuLabel className={`px-4 py-3 ${
            mode === 'public' ? 'text-white' : 'text-slate-700'
          }`}>
            Navigation Menu
          </DropdownMenuLabel>
          <DropdownMenuSeparator className={mode === 'public' ? 'bg-white/20' : 'bg-slate-200/50'} />
          
          <div className="max-h-80 overflow-y-auto">
            {getMenuItems().map((item) => {
              const IconComponent = item.icon;
              return (
                <DropdownMenuItem
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  className={`px-4 py-3 cursor-pointer transition-all duration-200 ${
                    mode === 'public'
                      ? 'text-white/90 hover:bg-white/10 focus:bg-white/10'
                      : 'text-slate-700 hover:bg-blue-50/50 focus:bg-blue-50/50'
                  }`}
                >
                  <IconComponent className="mr-3 h-4 w-4" />
                  <span>{item.label}</span>
                </DropdownMenuItem>
              );
            })}
          </div>

          {user && (
            <>
              <DropdownMenuSeparator className={mode === 'public' ? 'bg-white/20' : 'bg-slate-200/50'} />
              <DropdownMenuItem
                onClick={handleSignOut}
                className={`px-4 py-3 cursor-pointer transition-all duration-200 ${
                  mode === 'public'
                    ? 'text-red-400 hover:bg-red-500/20 focus:bg-red-500/20'
                    : 'text-red-600 hover:bg-red-50/50 focus:bg-red-50/50'
                }`}
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}