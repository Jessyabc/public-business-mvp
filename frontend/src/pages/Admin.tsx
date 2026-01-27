import { useState, useEffect, useCallback } from "react";
import { GlassCard } from "@/ui/components/GlassCard";
import { useToast } from "@/hooks/use-toast";
import { Lock, TrendingUp, Lightbulb, Users, Link2, ArrowRight, CheckCircle2, Clock, Building, XCircle, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useOrgAnalytics, useOrgTopInsights } from "@/hooks/useBusinessAnalytics";
import { useUserOrgId } from "@/features/orgs/hooks/useUserOrgId";
import { useAdminOrgRequests } from "@/hooks/useOrgRequests";
import { useIsBusinessMember, useIsOrgOwner } from "@/hooks/useOrgMembership";
import { Badge } from "@/components/ui/badge";
import { useUserOrgs } from "@/features/orgs/hooks/useUserOrgs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Admin() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin: checkAdmin, loading: rolesLoading } = useUserRoles();
  const navigate = useNavigate();
  const { data: orgId } = useUserOrgId();
  const { isBusinessMember } = useIsBusinessMember();
  const { isOrgOwner } = useIsOrgOwner();
  
  const [sortBy, setSortBy] = useState<'u_score' | 'continuations' | 'crosslinks' | 'recent'>('u_score');

  const isAdminUser = checkAdmin();
  const hasAccess = isAdminUser || isBusinessMember; // Allow admins and business members
  const loading = authLoading || rolesLoading;

  // Fetch org analytics
  const { data: orgAnalytics, isLoading: orgLoading } = useOrgAnalytics(orgId);
  const { data: topInsights, isLoading: insightsLoading } = useOrgTopInsights({
    orgId,
    limit: 10,
    sortBy,
  });

  // Org requests management (only for admins)
  const { requests: orgRequests, loading: orgRequestsLoading, approveRequest, rejectRequest, refetch: refetchOrgRequests } = useAdminOrgRequests();
  
  // Fetch all user organizations
  const { data: userOrgs, isLoading: orgsLoading } = useUserOrgs();


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

  // Require admin or business member role
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-destructive/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-destructive/10 rounded-full blur-3xl"></div>

        <GlassCard className="max-w-md w-full" padding="lg">
          <div className="text-center mb-6">
            <Lock className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">You must be an admin or business member to access this page</p>
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
    <div 
      className="min-h-screen p-6 relative overflow-hidden"
      style={{
        background: '#EAE6E2'
      }}
    >
      <div className="relative z-10 max-w-7xl mx-auto pt-20 pb-24 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold mb-4 text-[#3A3530]">Business Admin Panel</h1>
            <p className="text-[#6B635B]">Analytics dashboard for your organization</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/business-settings')}
            className="text-[#3A3530] border-[#D4CEC5] hover:bg-[#F5F1ED]"
            style={{
              background: '#EAE6E2',
              boxShadow: '4px 4px 10px rgba(166, 150, 130, 0.2), -4px -4px 10px rgba(255, 255, 255, 0.6)',
            }}
          >
            <Settings className="w-4 h-4 mr-2" />
            Business Settings
          </Button>
        </div>

        {/* My Organizations */}
        {userOrgs && userOrgs.length > 0 && (
          <GlassCard 
            className="border-0" 
            padding="lg"
            style={{
              background: '#EAE6E2',
              boxShadow: '8px 8px 20px rgba(166, 150, 130, 0.3), -8px -8px 20px rgba(255, 255, 255, 0.85)',
              borderRadius: '24px'
            }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#3A3530] mb-2">My Organizations</h2>
              <p className="text-[#6B635B]">All organizations you're a member of</p>
            </div>
            
            {orgsLoading ? (
              <div className="text-center py-8 text-[#6B635B]">Loading organizations...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userOrgs.map((org) => (
                  <div
                    key={org.id}
                    onClick={() => navigate(`/business-settings?org=${org.id}`)}
                    className="p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
                    style={{
                      background: '#F5F1ED',
                      boxShadow: 'inset 2px 2px 5px rgba(166, 150, 130, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.6)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 rounded-lg">
                        <AvatarImage src={org.logo_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary rounded-lg">
                          {org.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[#3A3530] truncate">{org.name}</h3>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              org.role === 'owner' 
                                ? 'bg-primary/20 text-primary border-primary/30' 
                                : 'bg-[#D4CEC5]/50 text-[#6B635B]'
                            }`}
                          >
                            {org.role === 'owner' ? 'Owner' : org.role === 'business_admin' ? 'Admin' : 'Member'}
                          </Badge>
                        </div>
                        {org.description && (
                          <p className="text-sm text-[#6B635B] line-clamp-2">{org.description}</p>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-xs text-[#3A3530] hover:text-[#3A3530] hover:bg-[#EAE6E2]"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/business-settings?org=${org.id}`);
                          }}
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Settings
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        )}

        {/* Organization Snapshot */}
        <GlassCard 
          className="border-0" 
          padding="lg"
          style={{
            background: '#EAE6E2',
            boxShadow: '8px 8px 20px rgba(166, 150, 130, 0.3), -8px -8px 20px rgba(255, 255, 255, 0.85)',
            borderRadius: '24px'
          }}
        >
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-[#3A3530]">Organization Snapshot</h2>
                {isOrgOwner && (
                  <Badge variant="default" className="bg-primary text-white border-primary/30">
                    Owner
                  </Badge>
                )}
                {isAdminUser && !isOrgOwner && (
                  <Badge variant="secondary" className="bg-[#D4CEC5]/50 text-[#6B635B]">
                    Admin
                  </Badge>
                )}
              </div>
              {isOrgOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/org/new')}
                  className="text-xs text-[#3A3530] border-[#D4CEC5] hover:bg-[#F5F1ED] hover:text-[#3A3530]"
                  style={{
                    boxShadow: '4px 4px 8px rgba(166, 150, 130, 0.2), -4px -4px 8px rgba(255, 255, 255, 0.6)',
                  }}
                >
                  <Building className="w-4 h-4 mr-1" />
                  Create Another Organization
                </Button>
              )}
            </div>
            <p className="text-[#6B635B]">
              {orgAnalytics?.org_name || 'Your Organization'}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <Lightbulb className="w-16 h-16 text-primary animate-pulse mx-auto mb-4" />
              <p className="text-[#6B635B]">Loading analytics...</p>
            </div>
          ) : !orgId ? (
            <div className="text-center py-12">
              <Building className="w-16 h-16 text-[#6B635B]/30 mx-auto mb-4" />
              <p className="text-[#6B635B]">No organization found. Analytics require organization membership.</p>
            </div>
          ) : orgAnalytics ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {/* Total Insights */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Lightbulb className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-1" style={{ textShadow: '0 0 20px hsl(var(--primary) / 0.4)' }}>
                  {orgAnalytics.total_insights}
                </div>
                <div className="text-sm text-[#6B635B]">Total Insights</div>
              </div>

              {/* Avg U-score */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-green-500 mb-1" style={{ textShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}>
                  {orgAnalytics.avg_u_score?.toFixed(1) || '0.0'}
                </div>
                <div className="text-sm text-[#6B635B]">Avg U-score</div>
              </div>

              {/* Total U ratings */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-blue-500 mb-1" style={{ textShadow: '0 0 20px rgba(59, 130, 246, 0.4)' }}>
                  {orgAnalytics.total_u_ratings}
                </div>
                <div className="text-sm text-[#6B635B]">U-ratings</div>
              </div>

              {/* Continuations */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                  <ArrowRight className="w-8 h-8 text-orange-500" />
                </div>
                <div className="text-3xl font-bold text-orange-500 mb-1" style={{ textShadow: '0 0 20px rgba(249, 115, 22, 0.4)' }}>
                  {orgAnalytics.total_continuations}
                </div>
                <div className="text-sm text-[#6B635B]">Continuations</div>
              </div>

              {/* Cross-links */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-pink-500/10 flex items-center justify-center">
                  <Link2 className="w-8 h-8 text-pink-500" />
                </div>
                <div className="text-3xl font-bold text-pink-500 mb-1" style={{ textShadow: '0 0 20px rgba(236, 72, 153, 0.4)' }}>
                  {orgAnalytics.total_crosslinks}
                </div>
                <div className="text-sm text-[#6B635B]">Cross-links</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#6B635B]">No analytics data available</p>
            </div>
          )}
        </GlassCard>

        {/* Organization Approval Requests - Admins Only */}
        {isAdminUser && (
          <GlassCard 
            className="border-0" 
            padding="lg"
            style={{
              background: '#EAE6E2',
              boxShadow: '8px 8px 20px rgba(166, 150, 130, 0.3), -8px -8px 20px rgba(255, 255, 255, 0.85)',
              borderRadius: '24px'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-[#3A3530]">
                  <Building className="w-6 h-6 text-blue-500" />
                  Organization Approval Requests
                </h2>
                <p className="text-[#6B635B]">Review and approve organization creation requests</p>
              </div>
              <Button variant="outline" size="sm" onClick={refetchOrgRequests} disabled={orgRequestsLoading}>
                Refresh
              </Button>
            </div>

            {orgRequestsLoading ? (
              <div className="text-center py-8">
                <Clock className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" />
                <p className="text-[#6B635B]">Loading organization requests...</p>
              </div>
            ) : orgRequests.length === 0 ? (
              <div className="text-center py-8 text-[#6B635B]">
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
                        <span className="text-xs text-[#6B635B]">
                          {new Date(request.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#6B635B]">
                        <Clock className="w-4 h-4" />
                        <span className="capitalize">{request.status}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-semibold text-lg mb-1">{request.org_name}</h3>
                      {request.org_description && (
                        <p className="text-sm text-[#6B635B] mb-2">{request.org_description}</p>
                      )}
                      {request.reason && (
                        <p className="text-sm italic text-[#6B635B]">"{request.reason}"</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-[#6B635B]">
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
        )}

        {/* Top Insights */}
        <GlassCard 
          className="border-0" 
          padding="lg"
          style={{
            background: '#EAE6E2',
            boxShadow: '8px 8px 20px rgba(166, 150, 130, 0.3), -8px -8px 20px rgba(255, 255, 255, 0.85)',
            borderRadius: '24px'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-[#3A3530]">Top Insights</h2>
              <p className="text-[#6B635B]">Best performing content</p>
            </div>
            
            {/* Sort selector */}
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'u_score' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('u_score')}
                className={sortBy === 'u_score' ? 'bg-[#3A3530] text-white hover:bg-[#2A2520]' : 'text-[#3A3530] border-[#D4CEC5] hover:bg-[#F5F1ED]'}
                style={sortBy === 'u_score' ? {
                  boxShadow: '4px 4px 8px rgba(166, 150, 130, 0.2), -4px -4px 8px rgba(255, 255, 255, 0.6)',
                } : {}}
              >
                U-score
              </Button>
              <Button
                variant={sortBy === 'continuations' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('continuations')}
                className={sortBy === 'continuations' ? 'bg-[#3A3530] text-white hover:bg-[#2A2520]' : 'text-[#3A3530] border-[#D4CEC5] hover:bg-[#F5F1ED]'}
                style={sortBy === 'continuations' ? {
                  boxShadow: '4px 4px 8px rgba(166, 150, 130, 0.2), -4px -4px 8px rgba(255, 255, 255, 0.6)',
                } : {}}
              >
                Continuations
              </Button>
              <Button
                variant={sortBy === 'crosslinks' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('crosslinks')}
                className={sortBy === 'crosslinks' ? 'bg-[#3A3530] text-white hover:bg-[#2A2520]' : 'text-[#3A3530] border-[#D4CEC5] hover:bg-[#F5F1ED]'}
                style={sortBy === 'crosslinks' ? {
                  boxShadow: '4px 4px 8px rgba(166, 150, 130, 0.2), -4px -4px 8px rgba(255, 255, 255, 0.6)',
                } : {}}
              >
                Cross-links
              </Button>
              <Button
                variant={sortBy === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('recent')}
                className={sortBy === 'recent' ? 'bg-[#3A3530] text-white hover:bg-[#2A2520]' : 'text-[#3A3530] border-[#D4CEC5] hover:bg-[#F5F1ED]'}
                style={sortBy === 'recent' ? {
                  boxShadow: '4px 4px 8px rgba(166, 150, 130, 0.2), -4px -4px 8px rgba(255, 255, 255, 0.6)',
                } : {}}
              >
                Recent
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <Lightbulb className="w-16 h-16 text-primary animate-pulse mx-auto mb-4" />
              <p className="text-[#6B635B]">Loading insights...</p>
            </div>
          ) : topInsights && topInsights.length > 0 ? (
            <div className="space-y-4">
              {topInsights.map((insight) => (
                <div
                  key={insight.post_id}
                  className="relative rounded-xl p-6 backdrop-blur-sm border border-[#D4CEC5] hover:border-primary/50 transition-all"
                  style={{
                    background: '#F5F1ED',
                    boxShadow: 'inset 2px 2px 5px rgba(166, 150, 130, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.5)',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-3 line-clamp-2 text-[#3A3530]">
                        {insight.title || 'Untitled Insight'}
                      </h3>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-[#6B635B]">U-score:</span>
                          <span className="font-medium text-green-500">{insight.u_score_avg?.toFixed(1) || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ArrowRight className="w-4 h-4 text-orange-500" />
                          <span className="text-[#6B635B]">Continuations:</span>
                          <span className="font-medium text-orange-500">{insight.continuations_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Link2 className="w-4 h-4 text-pink-500" />
                          <span className="text-[#6B635B]">Cross-links:</span>
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
              <Lightbulb className="w-16 h-16 text-[#6B635B]/30 mx-auto mb-4" />
              <p className="text-[#6B635B]">No insights yet. Create your first business insight!</p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

export default Admin;
