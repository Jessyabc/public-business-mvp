import { NavLink, useLocation } from 'react-router-dom';
import { Home, History, User, Building2, Brain } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { Badge } from '@/components/ui/badge';

export function BottomNavigation() {
  const location = useLocation();
  const { user } = useAuth();
  const { mode, toggleMode } = useAppMode();

  const navItems = [
    {
      to: '/',
      icon: Home,
      label: 'Home',
      badge: null
    },
    {
      to: '/history',
      icon: History,
      label: 'History',
      badge: null
    },
    {
      to: '/profile',
      icon: User,
      label: 'Profile',
      badge: null
    }
  ];

  if (!user) {
    return null; // Don't show navigation when not logged in
  }

  return (
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="glass-card rounded-full px-6 py-3 backdrop-blur-xl border border-white/20">
        <div className="flex items-center space-x-6">
          {/* Mode Toggle - Now clickable to switch modes */}
          <button 
            onClick={toggleMode}
            className="flex items-center space-x-2 px-3 py-2 glass-card rounded-full border border-[#489FE3]/30 hover:bg-[#489FE3]/10 transition-all duration-200"
          >
            {mode === 'public' ? (
              <Brain className="w-4 h-4 text-[#489FE3]" />
            ) : (
              <Building2 className="w-4 h-4 text-purple-400" />
            )}
            <span className={`text-xs font-medium ${mode === 'public' ? 'text-[#489FE3]' : 'text-purple-400'}`}>
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
                className={`relative flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'glass-card bg-[#489FE3]/20 text-[#489FE3]' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
                {item.badge && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs">
                    {item.badge}
                  </Badge>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}