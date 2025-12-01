import { useState } from "react";
import { GlassCard } from "@/ui/components/GlassCard";
import { useToast } from "@/hooks/use-toast";
import { Lock, TrendingUp, Lightbulb, Users, Link2, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppMode } from "@/contexts/AppModeContext";
import { useOrgAnalytics, useOrgTopInsights } from "@/hooks/useBusinessAnalytics";
import { useUserOrgId } from "@/features/orgs/hooks/useUserOrgId";

export function Admin() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin: checkAdmin, loading: rolesLoading } = useUserRoles();
  const navigate = useNavigate();
  const { mode } = useAppMode();
  const { data: orgId } = useUserOrgId();
  
  const [sortBy, setSortBy] = useState<'u_score' | 't_score' | 'continuations' | 'crosslinks' | 'recent'>('u_score');

  const isAdminUser = checkAdmin();
  const loading = authLoading || rolesLoading;

  // Fetch org analytics
  const { data: orgAnalytics, isLoading: orgLoading } = useOrgAnalytics(orgId);
  const { data: topInsights, isLoading: insightsLoading } = useOrgTopInsights({
    orgId,
    limit: 10,
    sortBy,
  });

  // Force business mode
  if (mode !== 'business') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        
        <GlassCard className="max-w-md w-full" padding="lg">
          <div className="text-center mb-6">
            <Lock className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Business Mode Required</h1>
            <p className="text-muted-foreground mt-2">
              Admin panel is only accessible in Business mode
            </p>
          </div>
          
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full"
          >
            Return Home
          </Button>
        </GlassCard>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  // Require authentication
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>

        <GlassCard className="max-w-md w-full" padding="lg">
          <div className="text-center mb-6">
            <Lock className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Authentication Required</h1>
            <p className="text-muted-foreground">Please sign in to access the admin panel</p>
          </div>
          
          <Button
            onClick={() => navigate('/auth')}
            className="w-full"
          >
            Sign In
          </Button>
        </GlassCard>
      </div>
    );
  }

  // Require admin role
  if (!isAdminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-destructive/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-destructive/10 rounded-full blur-3xl"></div>

        <GlassCard className="max-w-md w-full" padding="lg">
          <div className="text-center mb-6">
            <Lock className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access this page</p>
          </div>
          
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full"
          >
            Return Home
          </Button>
        </GlassCard>
      </div>
    );
  }

  const isLoading = orgLoading || insightsLoading;

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }}></div>

      <div className="relative z-10 max-w-7xl mx-auto pt-20 space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Business Admin Panel</h1>
          <p className="text-muted-foreground">Analytics dashboard for your organization</p>
        </div>

        {/* Organization Snapshot */}
        <GlassCard className="border-primary/20" padding="lg">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Organization Snapshot</h2>
            <p className="text-muted-foreground">
              {orgAnalytics?.org_name || 'Your Organization'}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <Lightbulb className="w-16 h-16 text-primary animate-pulse mx-auto mb-4" />
              <p className="text-muted-foreground">Loading analytics...</p>
            </div>
          ) : orgAnalytics ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {/* Total Insights */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Lightbulb className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-1" style={{ textShadow: '0 0 20px hsl(var(--primary) / 0.4)' }}>
                  {orgAnalytics.total_insights}
                </div>
                <div className="text-sm text-muted-foreground">Total Insights</div>
              </div>

              {/* Avg U-score */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-green-500 mb-1" style={{ textShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}>
                  {orgAnalytics.avg_u_score?.toFixed(1) || '0.0'}
                </div>
                <div className="text-sm text-muted-foreground">Avg U-score</div>
              </div>

              {/* Total U ratings */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-blue-500 mb-1" style={{ textShadow: '0 0 20px rgba(59, 130, 246, 0.4)' }}>
                  {orgAnalytics.total_u_ratings}
                </div>
                <div className="text-sm text-muted-foreground">U-ratings</div>
              </div>

              {/* Avg T-score */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
                <div className="text-3xl font-bold text-purple-500 mb-1" style={{ textShadow: '0 0 20px rgba(168, 85, 247, 0.4)' }}>
                  {orgAnalytics.avg_t_score?.toFixed(1) || '0.0'}
                </div>
                <div className="text-sm text-muted-foreground">Avg T-score</div>
              </div>

              {/* Continuations */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                  <ArrowRight className="w-8 h-8 text-orange-500" />
                </div>
                <div className="text-3xl font-bold text-orange-500 mb-1" style={{ textShadow: '0 0 20px rgba(249, 115, 22, 0.4)' }}>
                  {orgAnalytics.total_continuations}
                </div>
                <div className="text-sm text-muted-foreground">Continuations</div>
              </div>

              {/* Cross-links */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-pink-500/10 flex items-center justify-center">
                  <Link2 className="w-8 h-8 text-pink-500" />
                </div>
                <div className="text-3xl font-bold text-pink-500 mb-1" style={{ textShadow: '0 0 20px rgba(236, 72, 153, 0.4)' }}>
                  {orgAnalytics.total_crosslinks}
                </div>
                <div className="text-sm text-muted-foreground">Cross-links</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No analytics data available</p>
            </div>
          )}
        </GlassCard>

        {/* Top Insights */}
        <GlassCard className="border-primary/20" padding="lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Top Insights</h2>
              <p className="text-muted-foreground">Best performing content</p>
            </div>
            
            {/* Sort selector */}
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'u_score' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('u_score')}
              >
                U-score
              </Button>
              <Button
                variant={sortBy === 't_score' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('t_score')}
              >
                T-score
              </Button>
              <Button
                variant={sortBy === 'continuations' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('continuations')}
              >
                Continuations
              </Button>
              <Button
                variant={sortBy === 'crosslinks' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('crosslinks')}
              >
                Cross-links
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <Lightbulb className="w-16 h-16 text-primary animate-pulse mx-auto mb-4" />
              <p className="text-muted-foreground">Loading insights...</p>
            </div>
          ) : topInsights && topInsights.length > 0 ? (
            <div className="space-y-4">
              {topInsights.map((insight) => (
                <div
                  key={insight.post_id}
                  className="relative rounded-xl p-6 bg-background/30 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-3 line-clamp-2">
                        {insight.title || 'Untitled Insight'}
                      </h3>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="font-medium text-green-500">
                            U: {insight.u_score_avg?.toFixed(1) || '0.0'}
                          </span>
                          <span className="text-muted-foreground">
                            ({insight.u_score_count} ratings)
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-purple-500" />
                          <span className="font-medium text-purple-500">
                            T: {insight.t_score?.toFixed(1) || '0.0'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-orange-500" />
                          <span className="font-medium text-orange-500">
                            {insight.continuations_count} continuations
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link2 className="w-4 h-4 text-pink-500" />
                          <span className="font-medium text-pink-500">
                            {insight.crosslinks_count} cross-links
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => navigate(`/posts/${insight.post_id}`)}
                      className="shrink-0 bg-primary/20 hover:bg-primary/30 border border-primary/50"
                      style={{ 
                        boxShadow: '0 0 20px hsl(var(--primary) / 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Open Insight
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Lightbulb className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No insights found</p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

export default Admin;
