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
    // Core navigation items for all users
    const corePages = [
      { icon: Home, to: '/', label: 'Home' },
      { icon: Building2, to: '/industries', label: 'Industries' },
      { icon: Users, to: '/about', label: 'About' },
      { icon: Zap, to: '/features', label: 'Features' },
      { icon: MessageSquare, to: '/contact', label: 'Contact' },
    ];

    // For non-authenticated users
    if (!user) {
      return [
        ...corePages,
        { icon: User, to: '/auth', label: 'Sign In / Sign Up' },
      ];
    }

    // For authenticated users
    let userPages = [
      ...corePages,
      { icon: User, to: '/profile', label: 'Profile' },
      { icon: Settings, to: '/settings', label: 'Settings' },
      { icon: Bell, to: '/notifications', label: 'Notifications' },
    ];

    // Add business-specific pages for business members
    if (isBusinessMember() || isAdmin()) {
      userPages.push(
        { icon: Building2, to: '/business-dashboard', label: 'Business Dashboard' },
        { icon: Building2, to: '/business-membership', label: 'Business Membership' },
        { icon: Building2, to: '/business-profile', label: 'Business Profile' }
      );
      
      // Only admins get development pages
      if (isAdmin()) {
        userPages.push(
          { icon: Building2, to: '/create-business', label: 'Create Business' },
          { icon: FileText, to: '/dev/forms', label: 'Forms Showcase' },
          { icon: Plus, to: '/dev/components', label: 'Components Showcase' }
        );
      }
    }

    return userPages;
  };

  return (
    <div className="fixed top-6 right-6 z-[9999]">
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
          className={`w-80 mr-4 backdrop-blur-xl border shadow-2xl max-h-96 overflow-y-auto ${
            mode === 'public'
              ? 'bg-slate-900/95 border-white/20'
              : 'bg-white/95 border-blue-200/30'
          }`} 
          align="end"
          sideOffset={8}
        >
          <DropdownMenuLabel className={`px-4 py-3 ${
            mode === 'public' ? 'text-white' : 'text-slate-700'
          }`}>
            Navigation Menu
          </DropdownMenuLabel>
          <DropdownMenuSeparator className={mode === 'public' ? 'bg-white/20' : 'bg-slate-200/50'} />
          
          <div className="py-2">
            <div className={`px-4 py-2 text-xs font-semibold ${
              mode === 'public' ? 'text-white/70' : 'text-slate-500'
            }`}>
              All Pages ({getMenuItems().length})
            </div>
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