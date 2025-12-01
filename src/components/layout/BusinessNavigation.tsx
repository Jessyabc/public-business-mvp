import { Home, FileText, Plus, Bell, User } from 'lucide-react';
import { useComposerStore } from '@/hooks/useComposerStore';
import { GlassNavBar } from '@/components/ui/glass';

export const BusinessNavigation = () => {
  const { openComposer } = useComposerStore();

  const navItems = [
    { to: '/business-dashboard', icon: Home, label: 'Dashboard' },
    { to: '/brainstorm/feed', icon: FileText, label: 'Feed' },
    { to: '/notifications', icon: Bell, label: 'Alerts' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <GlassNavBar 
      items={navItems}
      composeButton={{
        onClick: () => openComposer(),
        icon: Plus,
      }}
    />
  );
};
