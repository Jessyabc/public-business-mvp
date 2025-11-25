import { NavLink, useLocation } from 'react-router-dom';
import { Home, History, Bell, Search, MessageSquare, Building2, Plus, Menu, X, ToggleRight, ToggleLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { useComposerStore } from '@/hooks/useComposerStore';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ComposerModal } from '@/components/composer/ComposerModal';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import styles from '@/components/effects/glassSurface.module.css';
import { useState } from 'react';
export function BottomNavigation() {
  const {
    isOpen,
    openComposer,
    closeComposer
  } = useComposerStore();
  const {
    user
  } = useAuth();
  const {
    mode,
    toggleMode
  } = useAppMode();
  const {
    isBusinessMember,
    isAdmin
  } = useUserRoles();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isBusinessMemberRole = isBusinessMember() || isAdmin();
  const navItems = [{
    to: '/',
    icon: Home,
    label: 'Feed',
    badge: null
  }, {
    to: '/my-posts',
    icon: MessageSquare,
    label: 'My Posts',
    badge: null
  }, {
    to: '/profile',
    icon: History,
    label: 'Profile',
    badge: null
  }, {
    to: '/notifications',
    icon: Bell,
    label: 'Notifications',
    badge: null
  }, {
    to: '/research',
    icon: Search,
    label: 'Research',
    badge: null
  }];

  // Only show navigation for logged-in users
  if (!user) {
    return null;
  }
  return <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-auto">
        <div className={`liquid-glass-dock px-3 sm:px-4 py-2 sm:py-2.5 ${isAdmin() ? 'admin-glow' : ''}`}>
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 flex-nowrap">
            {/* Mode Toggle */}
            <button onClick={toggleMode} className={`nav-item-bubble glass-nav-item px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1 sm:gap-2 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              mode === 'business'
                ? 'bg-black/8 hover:bg-black/12 text-[hsl(212,84%,20%)] hover:text-[hsl(212,84%,7%)]'
                : 'bg-white/10 hover:bg-white/15 text-white brightness-110 hover:text-white'
            }`}>
              {mode === 'public' ? <>
                  <ToggleRight className="transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] w-6 h-6" />
                  <span className="text-[10px] sm:text-[11px] md:text-xs font-medium transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hidden xs:inline">
                    Public
                  </span>
                </> : <>
                  <ToggleLeft className="w-6 h-6 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
                  <span className="text-[10px] sm:text-[11px] md:text-xs font-medium transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hidden xs:inline">
                    Business
                  </span>
                </>}
            </button>

            {/* Navigation Items */}
            {navItems.map(item => {
            const isActive = location.pathname === item.to;
            const IconComponent = item.icon;
            // Exclude search from main nav items (will be separate button)
            if (item.to === '/research') return null;
            return <NavLink key={item.to} to={item.to} className={`nav-item-bubble flex flex-col items-center justify-center space-y-0.5 sm:space-y-1 px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] glass-nav-item ${isActive ? 'active' : ''} ${
              mode === 'business' 
                ? isActive 
                  ? 'bg-black/10 text-[hsl(212,84%,7%)]' 
                  : 'text-[hsl(212,84%,30%)] hover:text-[hsl(212,84%,7%)] hover:bg-black/8'
                : isActive 
                  ? 'bg-white/15 text-white brightness-110' 
                  : 'text-white/90 brightness-110 hover:text-white hover:bg-white/10'
            }`}>
                  <IconComponent className="w-6 h-6 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] relative z-10" />
                  <span className="text-[10px] sm:text-[11px] md:text-xs font-medium transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] whitespace-nowrap relative z-10">{item.label}</span>
                  {item.badge && <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-20">
                      {item.badge}
                    </Badge>}
                </NavLink>;
          })}

            {/* Separate Search Button - Circular Glass */}
            <NavLink 
              to="/research" 
              className={`w-10 h-10 rounded-full backdrop-blur-glass-nav border flex items-center justify-center ml-1 sm:ml-2 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                location.pathname === '/research' ? 'active' : ''
              } ${
                mode === 'business'
                  ? 'bg-black/10 hover:bg-black/15 text-[hsl(212,84%,7%)] border-black/15'
                  : 'bg-white/15 hover:bg-white/25 text-white brightness-110 border-white/20'
              }`}
            >
              <Search className="w-5 h-5 relative z-10" />
            </NavLink>

            {/* Composer Button */}
            <Button onClick={() => openComposer()} className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full interactive-glass ml-1 sm:ml-2 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              mode === 'business'
                ? 'bg-black/10 hover:bg-black/15 text-[hsl(212,84%,7%)] border border-black/15'
                : 'bg-white/15 hover:bg-white/25 text-white brightness-110 border border-white/20'
            }`} size="icon">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation with Hamburger */}
      <nav className="md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-auto">
        <div className={`liquid-glass-dock px-3 py-2.5 flex items-center gap-2`}>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={`rounded-full transition-all duration-med ${
                mode === 'business'
                  ? 'text-[hsl(212,84%,30%)] hover:bg-black/10 hover:text-[hsl(212,84%,7%)]'
                  : 'text-white/90 hover:bg-white/15 hover:text-white'
              }`}>
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className={`liquid-glass-dock border-t h-auto rounded-t-3xl p-0 ${
              mode === 'business' ? 'border-black/15' : 'border-white/15'
            }`}>
              <div className="py-6 px-4 space-y-1">
                {/* Mode Toggle in Menu */}
                <button onClick={() => {
                toggleMode();
                setMenuOpen(false);
              }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl glass-nav-item transition-all ${
                mode === 'business'
                  ? 'text-[hsl(212,84%,20%)] hover:bg-black/10 hover:text-[hsl(212,84%,7%)]'
                  : 'text-white/90 hover:bg-white/15 hover:text-white'
              }`}>
                  {mode === 'public' ? <>
                      <Home className="w-5 h-5" />
                      <span className="font-medium">Public Mode</span>
                    </> : <>
                      <Building2 className="w-5 h-5" />
                      <span className="font-medium">Business Mode</span>
                    </>}
                </button>

                {/* Navigation Links in Menu */}
                {navItems.map(item => {
                const isActive = location.pathname === item.to;
                const IconComponent = item.icon;
                return <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className={`nav-item-bubble flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'active' : ''} ${
                  mode === 'business'
                    ? isActive
                      ? 'text-[hsl(212,84%,7%)] bg-black/10'
                      : 'text-[hsl(212,84%,30%)] hover:text-[hsl(212,84%,7%)] hover:bg-black/8'
                    : isActive
                      ? 'text-white bg-white/15'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}>
                      <IconComponent className="w-5 h-5 relative z-10" />
                      <span className="font-medium relative z-10">{item.label}</span>
                    </NavLink>;
              })}
              </div>
            </SheetContent>
          </Sheet>

          {/* Composer Button */}
          <Button onClick={() => openComposer()} className={`w-10 h-10 rounded-full transition-all duration-med ${
            mode === 'business'
              ? 'bg-black/10 hover:bg-black/15 text-[hsl(212,84%,7%)] border border-black/15'
              : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
          }`} size="icon">
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </nav>

      <ComposerModal isOpen={isOpen} onClose={closeComposer} />
    </>;
}