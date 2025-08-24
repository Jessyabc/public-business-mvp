import { NavLink } from 'react-router-dom';
import { useUIModeStore } from '@/stores/uiModeStore';
import { GlassCard } from '@/ui/components/GlassCard';
import { User, Brain, BarChart3, FileText, Bell, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useComposerStore } from '@/hooks/useComposerStore';

export function AdaptiveBottomBar() {
  const { uiMode } = useUIModeStore();
  const { openComposer } = useComposerStore();

  const publicTabs = [
    { icon: User, label: 'Profile', to: '/public/profile' },
    { icon: Brain, label: 'Brainstorms', to: '/public/brainstorms' },
    { icon: Bell, label: 'Notifications', to: '/public/notifications' },
  ];

  const businessTabs = [
    { icon: BarChart3, label: 'Dashboard', to: '/business/dashboard' },
    { icon: FileText, label: 'Reports', to: '/business/reports' },
    { icon: Bell, label: 'Notifications', to: '/business/notifications' },
  ];

  const tabs = uiMode === 'public' ? publicTabs : businessTabs;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <GlassCard className="flex items-center space-x-1 px-2 py-2">
        {tabs.map((tab, index) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) => cn(
              'flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all duration-200 min-w-[64px]',
              isActive
                ? 'text-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {({ isActive }) => (
              <>
                <tab.icon className={cn(
                  'w-5 h-5 mb-1',
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
            className="flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all duration-200 min-w-[64px] text-primary hover:text-primary/80"
          >
            <div className="w-5 h-5 mb-1 bg-primary rounded-full flex items-center justify-center">
              <Plus className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium">New</span>
          </button>
        )}
      </GlassCard>
    </div>
  );
}