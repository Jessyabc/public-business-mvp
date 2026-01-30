import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { X, Settings, FileText, Clock, LogOut, User, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  showBusinessHint?: boolean;
  onSwipeTowardsBusiness?: () => void;
}

export function ProfileSlidePanel({ 
  isOpen, 
  onClose, 
  showBusinessHint,
  onSwipeTowardsBusiness 
}: ProfileSlidePanelProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const menuItems = [
    { icon: User, label: 'Edit Profile', path: '/settings?tab=profile' },
    { icon: FileText, label: 'My Posts', path: '/profile?tab=posts' },
    { icon: Clock, label: 'Last Seen', path: '/profile?tab=lastSeen' },
    { icon: Settings, label: 'Settings', path: '/settings?tab=preferences' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "fixed right-0 top-0 bottom-0 w-[85%] max-w-[320px] z-[101]",
              "bg-background/95 backdrop-blur-xl",
              "border-l border-border/50",
              "shadow-[-8px_0_32px_rgba(0,0,0,0.3)]",
              "flex flex-col"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {profile?.display_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">
                    {profile?.display_name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="space-y-1 px-3">
                {menuItems.map((item) => (
                  <button
                    key={item.path + item.label}
                    onClick={() => handleNavigate(item.path)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl",
                      "text-foreground hover:bg-accent/10",
                      "transition-colors duration-200"
                    )}
                  >
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Business Hint */}
            {showBusinessHint && (
              <button
                onClick={onSwipeTowardsBusiness}
                className={cn(
                  "mx-4 mb-4 p-4 rounded-xl",
                  "bg-primary/5 border border-primary/20",
                  "flex items-center justify-between",
                  "text-left hover:bg-primary/10 transition-colors"
                )}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">Business Dashboard</p>
                  <p className="text-xs text-muted-foreground">Swipe left to access</p>
                </div>
                <ChevronLeft className="h-5 w-5 text-primary" />
              </button>
            )}

            {/* Footer */}
            <div className="p-4 border-t border-border/30">
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
