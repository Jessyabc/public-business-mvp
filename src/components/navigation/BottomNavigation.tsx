import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, Users, User, Building2, Brain } from 'lucide-react';
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
      to: '/explore',
      icon: Compass,
      label: 'Explore',
      badge: null
    },
    {
      to: '/community',
      icon: Users,
      label: 'Community',
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
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-700 ease-in-out">
      <div className={`glass-card rounded-full px-6 py-3 backdrop-blur-xl border transition-all duration-700 ease-in-out ${
        mode === 'public' 
          ? 'border-white/20 bg-black/20' 
          : 'border-blue-200/30 bg-white/40'
      }`}>
        <div className="flex items-center space-x-6">
          {/* Mode Toggle - Now clickable to switch modes */}
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
                className={`relative flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? mode === 'public'
                      ? 'glass-card bg-[#489FE3]/20 text-[#489FE3]'
                      : 'glass-card bg-blue-100/40 text-blue-600'
                    : mode === 'public'
                      ? 'text-white/70 hover:text-white hover:bg-white/10'
                      : 'text-slate-600 hover:text-slate-700 hover:bg-white/20'
                }`}
              >
                <IconComponent className="w-5 h-5 transition-all duration-300" />
                <span className="text-xs font-medium transition-all duration-300">{item.label}</span>
                {item.badge && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs transition-all duration-300">
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