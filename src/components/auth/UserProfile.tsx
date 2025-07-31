import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, Brain, Building2 } from 'lucide-react';
import { AuthModal } from './AuthModal';

export function UserProfile() {
  const { user, signOut, userType } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (!user) {
    return (
      <>
        <Button
          onClick={() => setShowAuthModal(true)}
          variant="outline"
          className="glass border-white/20 text-foreground hover:bg-white/10"
        >
          Sign In
        </Button>
        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      </>
    );
  }

  const initials = user.email?.charAt(0).toUpperCase() || 'U';
  const userTypeIcon = userType === 'business' ? Building2 : Brain;
  const UserTypeIcon = userTypeIcon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 glass border border-white/20">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback className="glass text-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="glass-card border-white/20 w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <UserTypeIcon className={`w-4 h-4 ${
                userType === 'business' ? 'text-slate-300' : 'text-blue-400'
              }`} />
              <span className="text-sm font-medium text-foreground">
                {userType === 'business' ? 'Business Member' : 'Public Member'}
              </span>
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem className="cursor-pointer hover:bg-white/10">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer hover:bg-white/10">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem 
          className="cursor-pointer hover:bg-white/10 text-red-400 focus:text-red-400"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}