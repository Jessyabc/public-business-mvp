import { NavLink } from 'react-router-dom';
import { useUIModeStore } from '@/stores/uiModeStore';
import { GlassCard } from '@/ui/components/GlassCard';
import { User, Brain, BarChart3, FileText, Bell, Plus, Settings, Building2, Users, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useComposerStore } from '@/hooks/useComposerStore';
import { useUserRoles } from '@/hooks/useUserRoles';

export function AdaptiveBottomBar() {
  const { uiMode } = useUIModeStore();
  const { openComposer } = useComposerStore();
  const { isAdmin, isBusinessMember } = useUserRoles();

  // Base tabs for each mode
  const publicTabs = [
    { icon: User, label: 'Profile', to: '/public/profile' },
    { icon: Brain, label: 'Brainstorms', to: '/public' },
    { icon: Bell, label: 'Notifications', to: '/public/notifications' },
  ];

  const businessTabs = [
    { icon: BarChart3, label: 'Dashboard', to: '/business/dashboard' },
    { icon: FileText, label: 'Feed', to: '/business' },
    { icon: Bell, label: 'Notifications', to: '/business/notifications' },
  ];

  // Additional admin tabs
  const adminTabs = [
    { icon: Settings, label: 'Admin', to: '/admin' },
    { icon: Users, label: 'Members', to: '/members/business-members' },
    { icon: Building2, label: 'Companies', to: '/business-profiles' },
    { icon: HelpCircle, label: 'Support', to: '/support/help-center' },
  ];

  // Determine which tabs to show
  let tabs = uiMode === 'public' ? publicTabs : businessTabs;
  
  // Add admin tabs for admin users
  if (isAdmin()) {
    // For admins, show more tabs and make them scrollable
    tabs = [...tabs, ...adminTabs];
  }

  return (
    <div className="pb-dock">
      <div className="glass-card flex items-center space-x-1 px-2 py-2 max-w-md mx-auto">
        <div className={cn(
          "flex items-center space-x-1",
          isAdmin() && "overflow-x-auto min-w-max"
        )}>
          {tabs.map((tab, index) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) => cn(
                'flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-med ease-pb min-w-[56px]',
                isActive
                  ? 'text-pb-blue font-semibold'
                  : 'text-ink-base/60 hover:text-ink-base'
              )}
            >
              {({ isActive }) => (
                <>
                  <tab.icon className={cn(
                    'w-4 h-4 mb-1 transition-transform duration-fast',
                    isActive && 'scale-110'
                  )} />
                  <span className="text-xs">{tab.label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* Composer button - only for public mode brainstorms */}
          {uiMode === 'public' && (
            <button
              onClick={() => openComposer()}
              className="flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-med ease-pb min-w-[56px] text-pb-blue hover:text-pb-blue/80"
            >
              <div className="w-4 h-4 mb-1 bg-pb-blue rounded-full flex items-center justify-center">
                <Plus className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-medium">New</span>
            </button>
          )}
        </div>
        
        {/* Scrim for readability */}
        <div className="scrim" />
      </div>
      
      {/* Admin indicator */}
      {isAdmin() && (
        <div className="absolute -top-2 -right-2 bg-pb-blue text-white text-xs px-2 py-1 rounded-full font-medium shadow-pbmd">
          Admin
        </div>
      )}
    </div>
  );
}