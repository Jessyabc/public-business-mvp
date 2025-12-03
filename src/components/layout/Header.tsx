import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { useProfile } from '@/hooks/useProfile';
import { Menu, X, LogOut, User, Settings } from 'lucide-react';
import styles from '@/components/effects/glassSurface.module.css';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    user
  } = useAuth();
  const {
    profile
  } = useProfile();
  const {
    mode
  } = useAppMode();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const handleSignOut = async () => {
    try {
      const {
        error
      } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error: unknown) {
      console.error('Failed to sign out', error);
      let description = 'Failed to sign out';
      if (error instanceof Error) {
        description = error.message;
      } else if (error && typeof error === 'object' && 'message' in error && typeof (error as {
        message?: unknown;
      }).message === 'string') {
        description = (error as {
          message: string;
        }).message;
      }
      toast({
        title: "Error",
        description,
        variant: "destructive"
      });
    }
  };

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/open-ideas', label: 'Open Ideas' },
    { to: '/about', label: 'About' },
    { to: '/features', label: 'Features' },
    { to: '/industries', label: 'Industries' },
    { to: '/members/business-members', label: 'Business Members' },
    { to: '/members/public-members', label: 'Public Members' },
    { to: '/contact', label: 'Contact' },
  ];
  if (user) return null; // Don't show header when user is logged in (they have connected interface navigation)

  return <>
      <header className="glass-card border border-pb-blue/20 fixed top-2 left-4 right-4 z-50 rounded-xl backdrop-blur-xl bg-white/10">
        <div className="scrim" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 sm:py-6 relative z-10 py-[15px]">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <NavLink to="/" className="flex items-center">
              <img src="/lovable-uploads/77267ade-34ff-4c2e-8797-fb16de997bd1.png" alt="Public Business - Creating Collaboration" className="h-10 sm:h-12 md:h-14 lg:h-16 object-contain" />
            </NavLink>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map(item => <NavLink key={item.to} to={item.to} className={({
              isActive
            }) => `text-sm font-medium transition-colors duration-med hover:text-pb-blue ${isActive ? 'text-pb-blue' : 'text-ink-base'}`}>
                  {item.label}
                </NavLink>)}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              {!user ? <>
                  <button onClick={() => setShowAuthModal(true)} className="glassButton glassButton--muted">
                    Login
                  </button>
                  <button onClick={() => setShowAuthModal(true)} className="glassButton glassButton--accent">
                    Sign Up
                  </button>
                </> : <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className={`relative h-8 w-8 rounded-full ${styles.glassButton}`}>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url || ''} />
                        <AvatarFallback>
                          {profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 glass-modal" align="end" forceMount>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/customize')}>
                      <span className="mr-2 h-4 w-4 flex items-center">🎨</span>
                      Customize Theme
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>}
            </div>

            {/* Mobile Menu Button */}
            <Button variant="ghost" className={`lg:hidden ${styles.glassButton}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && <div className="lg:hidden mt-4 pb-4">
              <div className="flex flex-col space-y-2">
                {navItems.map(item => <NavLink key={item.to} to={item.to} className={({
              isActive
            }) => `px-3 py-2 text-sm font-medium rounded-md transition-colors duration-med hover:text-pb-blue ${isActive ? 'text-pb-blue bg-pb-blue/10' : 'text-ink-base'}`} onClick={() => setMobileMenuOpen(false)}>
                    {item.label}
                  </NavLink>)}
                <div className="flex flex-col space-y-2 pt-4 border-t border-pb-blue/20">
                  {!user ? <>
                      <button onClick={() => setShowAuthModal(true)} className="glassButton glassButton--muted w-full">
                        Login
                      </button>
                      <button onClick={() => setShowAuthModal(true)} className="glassButton glassButton--accent w-full">
                        Sign Up
                      </button>
                    </> : <>
                      <Button variant="ghost" onClick={() => navigate('/profile')} className={styles.glassButton}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                      <Button variant="ghost" onClick={() => navigate('/settings')} className={styles.glassButton}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Button>
                      <Button variant="ghost" onClick={() => navigate('/customize')} className={styles.glassButton}>
                        <span className="mr-2">🎨</span>
                        Customize Theme
                      </Button>
                      <Button variant="destructive" onClick={handleSignOut} className={styles.glassButton}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </>}
                </div>
              </div>
            </div>}
        </div>
      </header>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>;
}