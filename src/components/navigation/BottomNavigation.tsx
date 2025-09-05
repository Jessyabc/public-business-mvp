import { NavLink, useLocation } from 'react-router-dom';
import { Home, History, Bell, Search, MessageSquare, Building2, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { useComposerStore } from '@/hooks/useComposerStore';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ComposerModal } from '@/components/composer/ComposerModal';
import { BusinessMemberBadge } from '@/components/business/BusinessMemberBadge';

export function BottomNavigation() {
  const { isOpen, openComposer, closeComposer } = useComposerStore();
  const { user } = useAuth();
  const { mode, toggleMode } = useAppMode();
  const { isBusinessMember, isAdmin } = useUserRoles();
  const location = useLocation();
  
  const isBusinessMemberRole = isBusinessMember() || isAdmin();

  const navItems = [
    { to: '/', icon: Home, label: 'Feed', badge: null },
    { to: '/my-posts', icon: MessageSquare, label: 'My Posts', badge: null },
    { to: '/profile', icon: History, label: 'Profile', badge: null },
    { to: '/notifications', icon: Bell, label: 'Notifications', badge: null },
    { to: '/research', icon: Search, label: 'Research', badge: null }
  ];

  if (!user) {
    return null; // Don't show navigation when not logged in
  }

  return (
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-slow ease-pb">
      <div className="glass-card rounded-full px-4 py-3 glass-content">
        <div className="flex items-center space-x-3">
          {/* Business Member Badge */}
          {isBusinessMemberRole && (
            <div className="flex items-center gap-2">
              <BusinessMemberBadge className="text-xs" />
              <NavLink
                to="/business-dashboard"
                className={`flex items-center px-2 py-1 rounded-lg transition-all duration-med ${
                  location.pathname === '/business-dashboard'
                    ? 'bg-pb-blue/20 text-pb-blue'
                    : 'hover:bg-white/10 text-pb-text2 hover:text-pb-text0'
                }`}
              >
                <Building2 className="w-4 h-4" />
              </NavLink>
            </div>
          )}

          {/* Mode Toggle */}
          <button 
            onClick={toggleMode}
            className="glass-button glass-nav-item"
          >
            {mode === 'public' ? (
              <Home className="w-4 h-4 text-pb-blue transition-all duration-med" />
            ) : (
              <Building2 className="w-4 h-4 text-pb-blue transition-all duration-med" />
            )}
            <span className="text-xs font-medium text-pb-blue transition-all duration-med ml-2">
              {mode === 'public' ? 'Public' : 'Business'}
            </span>
          </button>

          {/* Navigation Items */}
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            const IconComponent = item.icon;
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`relative flex flex-col items-center space-y-1 px-2 py-2 rounded-xl transition-all duration-med ${
                  isActive 
                    ? 'glass-nav-item bg-pb-blue/20 text-pb-blue'
                    : 'text-pb-text2 hover:text-pb-text0 hover:bg-white/10'
                }`}
              >
                <IconComponent className="w-4 h-4 transition-all duration-med" />
                <span className="text-xs font-medium transition-all duration-med whitespace-nowrap">{item.label}</span>
                {item.badge && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs transition-all duration-med">
                    {item.badge}
                  </Badge>
                )}
              </NavLink>
            );
          })}
          
          <Button
            onClick={() => openComposer()}
            className="w-10 h-10 rounded-full glass-button bg-pb-blue/20 hover:bg-pb-blue/30 text-pb-blue border-pb-blue/30 interactive-glass ml-2"
            size="icon"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ComposerModal 
        isOpen={isOpen} 
        onClose={closeComposer} 
      />
    </nav>
  );
}