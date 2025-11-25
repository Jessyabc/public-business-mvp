import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Home, User, Building2, Brain, FileText, Settings, Crown, Search, Bell, Info, Phone, Zap, HelpCircle, Compass, Users, Briefcase, Shield, Scale, Layers, Palette, Map } from 'lucide-react';
import { navItems } from '@/nav-items';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';

// Additional routes from router that aren't in navItems
const additionalRoutes = [
  { path: '/', title: 'Home', icon: Home, description: 'Main dashboard and feed' },
  { path: '/brainstorm', title: 'Brainstorm Feed', icon: Brain, description: 'Canonical brainstorm canvas', requiresAuth: true },
  { path: '/brainstorm/feed', title: 'Brainstorm Feed (Alt)', icon: Brain, description: 'Alternative brainstorm route', requiresAuth: true },
  { path: '/app/insights', title: 'Business Insights', icon: Building2, description: 'Business insights feed', requiresOrg: true },
  { path: '/org/new', title: 'Create Organization', icon: Building2, description: 'Create a new organization' },
  { path: '/idea/:id', title: 'Idea Detail', icon: Brain, description: 'View open idea details', dynamic: true },
  { path: '/open-ideas', title: 'Open Ideas', icon: Brain, description: 'Browse open ideas' },
  { path: '/open-ideas/new', title: 'New Open Idea', icon: Brain, description: 'Create a new open idea' },
  { path: '/admin', title: 'Admin Panel', icon: Shield, description: 'Administration panel', requiresAdmin: true },
  { path: '/customize', title: 'Customize Theme', icon: Palette, description: 'Customize your theme' },
  { path: '/demo/cards', title: 'Demo Cards', icon: Layers, description: 'PostCard showcase' },
  { path: '/landing', title: 'Landing Page', icon: Home, description: 'Public landing page' },
  { path: '/sitemap', title: 'Sitemap', icon: Map, description: 'This page - all accessible routes' },
  { path: '/dev/sitemap', title: 'Dev Sitemap', icon: ExternalLink, description: 'Development sitemap (dev only)', devOnly: true },
];

export default function Sitemap() {
  const { user } = useAuth();
  const { isBusinessMember, isAdmin } = useUserRoles();

  // Helper to get icon component
  const getIcon = (IconComponent: any) => IconComponent || ExternalLink;

  // Filter routes based on user permissions
  const filterRoute = (route: any) => {
    if (route.devOnly && import.meta.env.PROD) return false;
    if (route.requiresAuth && !user) return false;
    if (route.requiresAdmin && !isAdmin()) return false;
    if (route.requiresOrg && !isBusinessMember()) return false;
    return true;
  };

  // Group routes by category
  const categorizedRoutes = {
    'Main Pages': [
      { path: '/', title: 'Home', icon: Home, description: 'Main dashboard' },
      ...additionalRoutes.filter(r => ['/brainstorm', '/brainstorm/feed'].includes(r.path)),
    ],
    'User Pages': navItems.filter(item => 
      ['/profile', '/settings', '/my-posts', '/notifications'].includes(item.to)
    ).concat(
      additionalRoutes.filter(r => ['/customize'].includes(r.path))
    ),
    'Business Pages': navItems.filter(item => 
      item.to.includes('business') || item.to.includes('org')
    ).concat(
      additionalRoutes.filter(r => r.path.includes('insights') || r.path.includes('org'))
    ),
    'Ideas & Brainstorms': [
      ...additionalRoutes.filter(r => r.path.includes('idea') || r.path.includes('open-ideas')),
      ...navItems.filter(item => item.to.includes('research') || item.to.includes('explore')),
    ],
    'Community': navItems.filter(item => 
      item.to.includes('community') || item.to.includes('members')
    ),
    'Support & Help': navItems.filter(item => 
      item.to.includes('support') || item.to.includes('help') || item.to.includes('faq')
    ),
    'Legal': navItems.filter(item => 
      item.to.includes('legal') || item.to.includes('privacy') || item.to.includes('terms') || item.to.includes('cookie')
    ),
    'Public Pages': navItems.filter(item => 
      ['/about', '/contact', '/features', '/how-it-works', '/careers', '/industries'].includes(item.to)
    ),
    'Admin & Dev': [
      ...additionalRoutes.filter(r => r.path.includes('admin') || r.path.includes('dev') || r.path.includes('demo')),
      ...navItems.filter(item => item.to.includes('dev')),
    ],
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Platform Sitemap</h1>
          <p className="text-muted-foreground">All accessible pages in the platform</p>
        </div>

        {Object.entries(categorizedRoutes).map(([category, routes]) => {
          const filteredRoutes = routes.filter(filterRoute);
          if (filteredRoutes.length === 0) return null;

          return (
            <Card key={category} className="glass-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  {category}
                  <Badge variant="secondary">{filteredRoutes.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredRoutes.map((route) => {
                    const Icon = getIcon(route.icon);
                    const routePath = route.path || route.to;
                    const routeTitle = route.title || routePath;
                    return (
                      <Link
                        key={routePath}
                        to={routePath}
                        className="block"
                      >
                        <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-primary" />
                                <span className="font-mono text-sm text-primary hover:underline">
                                  {routePath}
                                </span>
                              </div>
                              <div className="flex gap-1">
                                {route.requiresAuth && (
                                  <Badge variant="outline" className="text-xs">Auth</Badge>
                                )}
                                {route.requiresAdmin && (
                                  <Badge variant="destructive" className="text-xs">Admin</Badge>
                                )}
                                {route.requiresOrg && (
                                  <Badge variant="default" className="text-xs">Org</Badge>
                                )}
                                {route.dynamic && (
                                  <Badge variant="secondary" className="text-xs">Dynamic</Badge>
                                )}
                              </div>
                            </div>
                            <h3 className="font-semibold text-sm mb-1">
                              {routeTitle}
                            </h3>
                            {route.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {route.description}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-foreground">Route Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center p-4 bg-muted/50 rounded">
                <div className="text-2xl font-bold text-primary">
                  {navItems.length + additionalRoutes.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Routes</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded">
                <div className="text-2xl font-bold text-green-500">
                  {Object.values(categorizedRoutes).flat().filter(filterRoute).length}
                </div>
                <div className="text-sm text-muted-foreground">Accessible Now</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded">
                <div className="text-2xl font-bold text-blue-500">
                  {user ? 'Yes' : 'No'}
                </div>
                <div className="text-sm text-muted-foreground">Authenticated</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded">
                <div className="text-2xl font-bold text-purple-500">
                  {isBusinessMember() ? 'Yes' : 'No'}
                </div>
                <div className="text-sm text-muted-foreground">Business Member</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

