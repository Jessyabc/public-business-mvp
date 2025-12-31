import { useState, useEffect, useCallback } from "react";
import { GlassCard } from "@/ui/components/GlassCard";
import { useToast } from "@/hooks/use-toast";
import { Lock, TrendingUp, Lightbulb, Users, Link2, ArrowRight, CheckCircle2, Clock, Building, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useOrgAnalytics, useOrgTopInsights } from "@/hooks/useBusinessAnalytics";
import { useUserOrgId } from "@/features/orgs/hooks/useUserOrgId";
import { rpcAdminApproveIntake, rpcAdminApproveUser, rpcAdminListPending } from "@/integrations/supabase/rpc";
import { AdminPendingIdea } from "@/features/admin/openIdeas/types";
import { useAdminOrgRequests } from "@/hooks/useOrgRequests";

export function Admin() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin: checkAdmin, loading: rolesLoading } = useUserRoles();
  const navigate = useNavigate();
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

  // Org requests management
  const { requests: orgRequests, loading: orgRequestsLoading, approveRequest, rejectRequest, refetch: refetchOrgRequests } = useAdminOrgRequests();

  const [pendingIdeas, setPendingIdeas] = useState<AdminPendingIdea[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const refreshPendingIdeas = useCallback(async () => {
    if (!user || !isAdminUser) return;

    setPendingLoading(true);
    setPendingError(null);

    const start = performance.now();
    const { data, error } = await rpcAdminListPending(200);
    const duration = performance.now() - start;
    console.info(`[admin-open-ideas] list_pending duration=${duration.toFixed(1)}ms`);

    if (error) {
      console.error('Failed to fetch pending ideas', error.message);
      setPendingError(error.message || 'Unable to load pending ideas');
      toast({
        title: 'Failed to load pending ideas',
        description: error.message,
        variant: 'destructive'
      });
      setPendingLoading(false);
      return;
    }

    setPendingIdeas(data || []);
    setPendingLoading(false);
  }, [isAdminUser, toast, user]);

  const approveIdea = useCallback(async (idea: AdminPendingIdea) => {
    setApprovingId(idea.id);
    setPendingError(null);

    const start = performance.now();
    const { error } = idea.source === 'intake'
      ? await rpcAdminApproveIntake(idea.id)
      : await rpcAdminApproveUser(idea.id);
    const duration = performance.now() - start;
    console.info(`[admin-open-ideas] approve_${idea.source} duration=${duration.toFixed(1)}ms`);

    if (error) {
      console.error('Failed to approve idea', error.message);
      setPendingError(error.message || 'Unable to approve idea');
      toast({
        title: 'Approval failed',
        description: error.message,
        variant: 'destructive'
      });
      setApprovingId(null);
      return;
    }

    toast({
      title: 'Idea approved',
      description: 'The idea has been moved to approved status.'
    });
    setApprovingId(null);
    refreshPendingIdeas();
  }, [refreshPendingIdeas, toast]);

  useEffect(() => {
    if (!user || !isAdminUser) return;
    refreshPendingIdeas();
  }, [isAdminUser, refreshPendingIdeas, user]);

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

        {/* Pending Organization Requests */}
        <GlassCard className="border-blue-500/20" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Building className="w-6 h-6 text-blue-500" />
                Organization Requests
              </h2>
              <p className="text-muted-foreground">Users requesting to create business accounts</p>
            </div>
            <Button variant="outline" size="sm" onClick={refetchOrgRequests} disabled={orgRequestsLoading}>
              Refresh
            </Button>
          </div>

          {orgRequestsLoading ? (
            <div className="text-center py-8">
              <Clock className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" />
              <p className="text-muted-foreground">Loading organization requests...</p>
            </div>
          ) : orgRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending organization requests.
            </div>
          ) : (
            <div className="space-y-4">
              {orgRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-xl border border-blue-500/30 p-4 bg-blue-500/5 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                        Organization
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(request.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="capitalize">{request.status}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-1">{request.org_name}</h3>
                    {request.org_description && (
                      <p className="text-sm text-muted-foreground mb-2">{request.org_description}</p>
                    )}
                    {request.reason && (
                      <p className="text-sm italic text-muted-foreground/80">"{request.reason}"</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      User: {request.user_id.slice(0, 8)}...
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                        onClick={() => rejectRequest(request.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => approveRequest(request.id)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Pending Open Ideas */}
        <GlassCard className="border-primary/20" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Pending Open Ideas</h2>
              <p className="text-muted-foreground">Combined intake + authenticated submissions</p>
            </div>
            <Button variant="outline" size="sm" onClick={refreshPendingIdeas} disabled={pendingLoading}>
              Refresh
            </Button>
          </div>

          {pendingError && (
            <div className="mb-4 text-sm text-destructive">
              {pendingError}
            </div>
          )}

          {pendingLoading ? (
            <div className="text-center py-8">
              <Clock className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
              <p className="text-muted-foreground">Loading pending ideas...</p>
            </div>
          ) : pendingIdeas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending submissions. Great job staying on top of reviews!
            </div>
          ) : (
            <div className="space-y-4">
              {pendingIdeas.map((idea) => (
                <div
                  key={`${idea.source}-${idea.id}`}
                  className="rounded-xl border border-border/60 p-4 bg-background/50 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                        {idea.source}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {idea.created_at ? new Date(idea.created_at).toLocaleString() : 'Unknown date'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="capitalize">{idea.status}</span>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed whitespace-pre-wrap mb-4">{idea.text}</p>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {idea.user_id ? `User: ${idea.user_id}` : 'Anonymous submission'}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => approveIdea(idea)}
                      disabled={approvingId === idea.id}
                    >
                      {approvingId === idea.id ? 'Approving...' : 'Approve'}
                    </Button>
                  </div>
                </div>
              ))}
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
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-muted-foreground">U-score:</span>
                          <span className="font-medium text-green-500">{insight.u_score_avg?.toFixed(1) || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-purple-500" />
                          <span className="text-muted-foreground">T-score:</span>
                          <span className="font-medium text-purple-500">{insight.t_score?.toFixed(1) || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ArrowRight className="w-4 h-4 text-orange-500" />
                          <span className="text-muted-foreground">Continuations:</span>
                          <span className="font-medium text-orange-500">{insight.continuations_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Link2 className="w-4 h-4 text-pink-500" />
                          <span className="text-muted-foreground">Cross-links:</span>
                          <span className="font-medium text-pink-500">{insight.crosslinks_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Lightbulb className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No insights yet. Create your first business insight!</p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

export default Admin;
