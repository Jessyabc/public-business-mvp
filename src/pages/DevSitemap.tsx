import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, RotateCcw, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const sitemapData = {
  canonical_routes: [
    { path: '/', component: 'Index', description: 'Main dashboard' },
    { path: '/brainstorm', component: 'BrainstormPage', description: 'Canonical brainstorm canvas' },
  ],
  redirects: [
    { from: '/brainstorm-v2', to: '/brainstorm', reason: 'Legacy consolidation' }
  ],
  legacy_routes: [
    { path: '/brainstorms', status: 'deprecated', replacement: '/brainstorm' }
  ],
  navigation_health: { orphaned_pages: [], destinationless_links: 0, missing_404: false }
};

export default function DevSitemap() {
  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Development Only</h2>
            <p className="text-muted-foreground">This page is only available in development mode.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-background via-background/95 to-muted/20">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">App Sitemap</h1>
          <p className="text-muted-foreground">Development-only route visualization and health check</p>
        </div>

        {/* Canonical Routes */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Canonical Routes
              <Badge variant="default">{sitemapData.canonical_routes.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sitemapData.canonical_routes.map((route) => (
                <Card key={route.path} className="glass-surface hover:glass-hover transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Link
                        to={route.path}
                        className="font-mono text-sm text-primary hover:underline"
                      >
                        {route.path}
                      </Link>
                      <Badge variant="secondary" className="text-xs">
                        {route.component}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {route.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Redirects */}
        <Card className="glass-card">
          <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Redirects
              <Badge variant="secondary">{sitemapData.redirects.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sitemapData.redirects.map((redirect) => (
                <div key={redirect.from} className="flex items-center justify-between p-3 glass-surface rounded">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-muted-foreground">{redirect.from}</span>
                    <RotateCcw className="w-4 h-4 text-primary" />
                    <span className="font-mono text-sm text-foreground">{redirect.to}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {redirect.reason}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Legacy Routes */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Legacy Routes
              <Badge variant="destructive">{sitemapData.legacy_routes.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sitemapData.legacy_routes.map((legacy) => (
                <div key={legacy.path} className="flex items-center justify-between p-3 glass-surface rounded">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-muted-foreground line-through">
                      {legacy.path}
                    </span>
                    <RotateCcw className="w-4 h-4 text-destructive" />
                    <span className="font-mono text-sm text-foreground">{legacy.replacement}</span>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {legacy.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Health */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-foreground">Navigation Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 glass-surface rounded text-center">
                <div className="text-2xl font-bold text-green-500">
                  {sitemapData.navigation_health.orphaned_pages.length}
                </div>
                <div className="text-sm text-muted-foreground">Orphaned Pages</div>
              </div>
              <div className="p-4 glass-surface rounded text-center">
                <div className="text-2xl font-bold text-green-500">
                  {sitemapData.navigation_health.destinationless_links}
                </div>
                <div className="text-sm text-muted-foreground">Broken Links</div>
              </div>
              <div className="p-4 glass-surface rounded text-center">
                <div className="text-2xl font-bold text-green-500">
                  {sitemapData.navigation_health.missing_404 ? '❌' : '✅'}
                </div>
                <div className="text-sm text-muted-foreground">404 Handler</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Flags */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-foreground">Feature Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between p-3 glass-surface rounded">
                <span className="font-mono text-sm">SHOW_RIGHT_SIDEBAR</span>
                <Badge variant={process.env.REACT_APP_SHOW_RIGHT_SIDEBAR !== 'false' ? 'default' : 'secondary'}>
                  {process.env.REACT_APP_SHOW_RIGHT_SIDEBAR !== 'false' ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 glass-surface rounded">
                <span className="font-mono text-sm">BRAINSTORM_WRITES_ENABLED</span>
                <Badge variant={process.env.REACT_APP_BRAINSTORM_WRITES_ENABLED === 'true' ? 'default' : 'secondary'}>
                  {process.env.REACT_APP_BRAINSTORM_WRITES_ENABLED === 'true' ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}