import { useAppMode } from '@/contexts/AppModeContext';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Brain, 
  Home, 
  Plus, 
  History, 
  Bell, 
  Search, 
  User,
  Building2,
  FileText,
  Presentation,
  Calendar
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const publicItems = [
  { title: "Brainstorm Feed", url: "/", icon: Home },
  { title: "My Brainstorms", url: "/my-brainstorms", icon: Brain },
  { title: "New Brainstorm", url: "/new-brainstorm", icon: Plus },
  { title: "History", url: "/history", icon: History },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Research", url: "/research", icon: Search },
  { title: "Profile", url: "/profile", icon: User },
];

const businessItems = [
  { title: "Business Feed", url: "/business", icon: Building2 },
  { title: "My Posts", url: "/my-posts", icon: FileText },
  { title: "New Insight", url: "/new-insight", icon: Plus },
  { title: "Activities", url: "/activities", icon: Calendar },
  { title: "History", url: "/history", icon: History },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Research", url: "/research", icon: Search },
  { title: "Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { mode } = useAppMode();
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const items = mode === 'public' ? publicItems : businessItems;
  const isActive = (path: string) => currentPath === path;

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? `${mode === 'public' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-slate-500/20 text-slate-300 border-slate-500/30'} border` 
      : 'hover:bg-white/5';

  return (
    <Sidebar
      className={`${collapsed ? "w-14" : "w-60"} transition-all duration-300 ${
        mode === 'public' 
          ? 'bg-slate-900/50 border-blue-500/20' 
          : 'bg-slate-800/50 border-slate-500/20'
      } backdrop-blur-xl border-r`}
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={`${
            mode === 'public' ? 'text-blue-400' : 'text-slate-300'
          } font-medium text-xs uppercase tracking-wider`}>
            {mode === 'public' ? 'Public Space' : 'Business Hub'}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => 
                        `flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${getNavClass({ isActive })}`
                      }
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}