// src/components/navigation/BottomNavigation.tsx
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
import styles from '@/components/effects/glassSurface.module.css';

export function BottomNavigation() {
  const { isOpen, openComposer, closeComposer } = useComposerStore();
  const { user } = useAuth();
  const { mode, toggleMode } = useAppMode();
  const { isBusinessMember, isAdmin } = useUserRoles();
  const location = useLocation();

  const isBusinessMemberRole = isBusinessMember() || isAdmin();

  const navItems = [
    { to: '/', icon: Home, label: 'Feed', badge: null },              // root shows dynamic feed by mode
    { to: '/my-posts', icon: MessageSquare, label: 'My Posts', badge: null },
    { to: '/profile', icon: History, label: 'Profile', badge: null },
    { to: '/notifications', icon: Bell, label: 'Notifications', badge: null },
    { to: '/research', icon: Search, label: 'Research', badge: null }
  ];

  // Only show navigation for logged-in users
  if (!user) {
    return null;
  }

  return (
    <nav className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-slow ease-pb max-w-[95vw] sm:max-w-none">
      <div className={`glass-card rounded-full px-2 sm:px-4 py-2 sm:py-3 glass-content glass-high overflow-x-auto border-2 border-white/20 backdrop-blur-xl bg-white/10 ${isAdmin() ? 'admin-glow' : ''}`}>
        <div className="flex items-center space-x-1 sm:space-x-3 min-w-max">
          {/* Mode Toggle - only show one control */}
          <button 
            onClick={toggleMode} 
            className={`${styles.glassButton} glass-nav-item px-2 sm:px-3 flex items-center gap-1 sm:gap-2`}
          >
            {mode === 'public' ? (
              <>
                <Home className="w-4 h-4 text-pb-blue transition-all duration-med" />
                <span className="text-xs font-medium text-pb-blue transition-all duration-med hidden xs:inline">
                  Public
                </span>
              </>
            ) : (
              <>
                <Building2 className="w-4 h-4 text-pb-blue transition-all duration-med" />
                <span className="text-xs font-medium text-pb-blue transition-all duration-med hidden xs:inline">
                  Business
                </span>
              </>
            )}
          </button>

          {/* Navigation Items */}
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            const IconComponent = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`relative flex flex-col items-center space-y-0.5 sm:space-y-1 px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-xl transition-all duration-med glass-nav-item ${
                  isActive ? 'bg-pb-blue/20 text-pb-blue' : 'text-pb-text2 hover:text-pb-text0 hover:bg-white/10'
                }`}
              >
                <IconComponent className="w-4 h-4 transition-all duration-med" />
                <span className="text-[10px] sm:text-xs font-medium transition-all duration-med whitespace-nowrap">{item.label}</span>
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
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${styles.glassButton} bg-pb-blue/20 hover:bg-pb-blue/30 text-pb-blue border-pb-blue/30 interactive-glass ml-1 sm:ml-2`}
            size="icon"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ComposerModal isOpen={isOpen} onClose={closeComposer} />
    </nav>
  );
}
