import { NavLink, useLocation } from 'react-router-dom';
import { Home, History, Bell, Search, MessageSquare, Brain, Building2, User, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { useComposerStore } from '@/hooks/useComposerStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function BottomNavigation() {
  const { openComposer } = useComposerStore();
  const { user } = useAuth();
  const { mode, toggleMode } = useAppMode();
  const location = useLocation();

  const navItems = [
    { to: '/', icon: Home, label: 'Feed', badge: null },
    { to: '/history', icon: History, label: 'Profile & History', badge: null },
    { to: '/notifications', icon: Bell, label: 'Notifications', badge: 3 },
    { to: '/research', icon: Search, label: 'Research', badge: null },
    { to: '/beta-feedback', icon: MessageSquare, label: 'PB', badge: null }
  ];

  if (!user) {
    return null; // Don't show navigation when not logged in
  }

  return (
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-700 ease-in-out">
      <div className={`glass-card rounded-full px-4 py-3 backdrop-blur-xl border transition-all duration-700 ease-in-out ${
        mode === 'public' 
          ? 'border-white/20 bg-black/20' 
          : 'border-blue-200/30 bg-white/40'
      }`}>
        <div className="flex items-center space-x-3">
          {/* Mode Toggle */}
          <button 
            onClick={toggleMode}
            className={`flex items-center space-x-2 px-3 py-2 glass-card rounded-full border transition-all duration-500 ease-in-out ${
              mode === 'public'
                ? 'border-[#489FE3]/30 hover:bg-[#489FE3]/10'
                : 'border-blue-300/40 hover:bg-blue-100/20 bg-white/30'
            }`}
          >
            {mode === 'public' ? (
              <Brain className="w-4 h-4 text-[#489FE3] transition-all duration-300" />
            ) : (
              <Building2 className="w-4 h-4 text-blue-600 transition-all duration-300" />
            )}
            <span className={`text-xs font-medium transition-all duration-300 ${
              mode === 'public' ? 'text-[#489FE3]' : 'text-blue-600'
            }`}>
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
                className={`relative flex flex-col items-center space-y-1 px-2 py-2 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? mode === 'public'
                      ? 'glass-card bg-[#489FE3]/20 text-[#489FE3]'
                      : 'glass-card bg-blue-100/40 text-blue-600'
                    : mode === 'public'
                      ? 'text-white/70 hover:text-white hover:bg-white/10'
                      : 'text-slate-600 hover:text-slate-700 hover:bg-white/20'
                }`}
              >
                <IconComponent className="w-4 h-4 transition-all duration-300" />
                <span className="text-xs font-medium transition-all duration-300 whitespace-nowrap">{item.label}</span>
                {item.badge && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs transition-all duration-300">
                    {item.badge}
                  </Badge>
                )}
              </NavLink>
            );
          })}
          
          {/* Create Button */}
          <Button
            onClick={() => openComposer()}
            className={`w-10 h-10 rounded-full transition-all duration-300 hover:scale-110 ml-2 ${
              mode === 'public'
                ? 'bg-primary/20 hover:bg-primary/30 text-primary border-primary/30'
                : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 border-blue-500/30'
            } glass-card backdrop-blur-xl border`}
            size="icon"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}