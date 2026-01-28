import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { BusinessInvitations } from '@/components/business/BusinessInvitations';
import { useComposerStore } from '@/hooks/useComposerStore';
import { usePosts } from '@/hooks/usePosts';
import { BusinessMemberBadge } from '@/components/business/BusinessMemberBadge';
import { useIsOrgOwnerOf } from '@/hooks/useOrgMembership';
import { useUserOrgId } from '@/features/orgs/hooks/useUserOrgId';
import { useUserOrgs } from '@/features/orgs/hooks/useUserOrgs';
import { useOrganization } from '@/features/orgs/hooks/useOrganization';
import { OrganizationProfileForm } from '@/features/orgs/components/OrganizationProfileForm';
import { getOrgLogoSignedUrl } from '@/features/orgs/utils/getOrgLogoSignedUrl';
import { PostReaderModal } from '@/components/posts/PostReaderModal';
import { supabase } from '@/integrations/supabase/client';
import type { Post } from '@/types/post';
import { 
  Building2, 
  Users, 
  FileText, 
  TrendingUp, 
  Settings, 
  Plus,
  Crown,
  Eye
} from 'lucide-react';

export function BusinessDashboard() {
  // All hooks must be called unconditionally before any early returns
  const { isBusinessMember, isAdmin, canCreateBusinessPosts } = useUserRoles();
  const { profile } = useBusinessProfile();
  const { openComposer } = useComposerStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: defaultOrgId } = useUserOrgId();
  const { data: userOrgs, isLoading: orgsLoading } = useUserOrgs();
  const { posts, loading: postsLoading, fetchPosts } = usePosts();
  const [readerModalPost, setReaderModalPost] = useState<Post | null>(null);
  
  // Get selected orgId from URL param or use default
  const orgIdFromUrl = searchParams.get('org');
  const selectedOrgId = orgIdFromUrl || defaultOrgId || (userOrgs?.[0]?.id);
  const [selectedOrgIdState, setSelectedOrgIdState] = useState<string | null>(null);
  
  // Fetch post by ID for modal
  const fetchPostById = useCallback(async (id: string): Promise<Post | null> => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      return data as Post;
    } catch (err) {
      console.error('Error fetching post:', err);
      return null;
    }
  }, []);
  
  // Listen for post view events
  useEffect(() => {
    const handleShowThread = async (event: CustomEvent) => {
      const { postId, post } = event.detail;
      if (post) {
        setReaderModalPost(post as Post);
      } else if (postId) {
        const fetchedPost = await fetchPostById(postId);
        if (fetchedPost) {
          setReaderModalPost(fetchedPost);
        }
      }
    };
    window.addEventListener('pb:brainstorm:show-thread', handleShowThread as EventListener);
    return () => window.removeEventListener('pb:brainstorm:show-thread', handleShowThread as EventListener);
  }, [fetchPostById]);
  
  // Initialize and update selected org when data is available
  useEffect(() => {
    if (selectedOrgId) {
      setSelectedOrgIdState(selectedOrgId);
    } else if (userOrgs && userOrgs.length > 0) {
      setSelectedOrgIdState((prev) => prev || userOrgs[0].id);
    }
  }, [selectedOrgId, userOrgs]);
  
  // Get initial tab from URL param, default to 'overview'
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Sync tab state when URL params change
  useEffect(() => {
    const tab = searchParams.get('tab') || 'overview';
    setActiveTab(tab);
  }, [searchParams]);

  // These must come after all hooks but before early returns
  const selectedOrg = userOrgs?.find(org => org.id === selectedOrgIdState);
  const { data: currentOrganization } = useOrganization(selectedOrgIdState);
  const { isOwner: isOrgOwner } = useIsOrgOwnerOf(selectedOrgIdState);
  const isAdminRole = isAdmin();
  const isReadOnly = !isOrgOwner && !isAdminRole;
  const isBusinessMemberRole = isBusinessMember() || isAdmin();
  
  // State for organization logo
  const [orgLogoSignedUrl, setOrgLogoSignedUrl] = useState<string | null>(null);
  
  // Fetch signed URL for organization logo
  useEffect(() => {
    const fetchLogoSignedUrl = async () => {
      if (currentOrganization?.logo_url && currentOrganization?.id) {
        // Check if it's already a full URL (legacy) or a path
        if (currentOrganization.logo_url.startsWith('http://') || currentOrganization.logo_url.startsWith('https://')) {
          setOrgLogoSignedUrl(currentOrganization.logo_url);
        } else {
          // Get signed URL from Edge Function
          const signedUrl = await getOrgLogoSignedUrl(currentOrganization.id, currentOrganization.logo_url);
          setOrgLogoSignedUrl(signedUrl);
        }
      } else {
        setOrgLogoSignedUrl(null);
      }
    };

    fetchLogoSignedUrl();
  }, [currentOrganization?.logo_url, currentOrganization?.id]);
  
  // Fetch business insights when selectedOrgIdState changes
  useEffect(() => {
    if (selectedOrgIdState) {
      fetchPosts('business');
    }
  }, [selectedOrgIdState, fetchPosts]);
  
  // Filter business insights for the selected organization
  const businessInsights = posts
    .filter(p => 
      p.kind === 'BusinessInsight' && 
      p.mode === 'business' && 
      p.org_id === selectedOrgIdState &&
      p.status === 'active' &&
      p.published_at !== null
    )
    .sort((a, b) => {
      // Sort by created_at descending (newest first) for chronological order
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  
  // Get the most recent insights for Recent Activity (limit to 5)
  const recentActivityInsights = businessInsights.slice(0, 5);
  
  const handleOrgChange = (newOrgId: string) => {
    setSelectedOrgIdState(newOrgId);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('org', newOrgId);
      return newParams;
    }, { replace: true });
  };

  if (!isBusinessMemberRole) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Business Access Required</h2>
            <p className="text-muted-foreground mb-4">
              You need to be a Business Member to access this dashboard.
            </p>
            <Button asChild>
              <a href="/create-business">Create Business</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        background: '#EAE6E2',
        padding: '1.5rem'
      }}
    >
      <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <img 
              src="/lovable-uploads/77267ade-34ff-4c2e-8797-fb16de997bd1.png" 
              alt="Public Business - Creating Collaboration" 
              className="h-10 w-auto"
            />
            <h1 className="text-3xl font-bold text-[#3A3530]">Business Dashboard</h1>
            {isOrgOwner && (
              <Badge variant="default" className="bg-primary text-white border-primary/30">
                Owner
              </Badge>
            )}
            {isAdminRole && !isOrgOwner && (
              <Badge variant="secondary" className="bg-[#6B635B] text-white">
                Admin
              </Badge>
            )}
            <BusinessMemberBadge className="bg-[#3A3530] text-white" />
          </div>
          {profile && (
            <p className="text-[#6B635B]">
              Welcome back to {profile.company_name}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Organization Selector - show if user has multiple orgs */}
          {userOrgs && userOrgs.length > 1 && (
            <Select value={selectedOrgIdState || ''} onValueChange={handleOrgChange}>
              <SelectTrigger 
                className="w-[250px] text-[#3A3530] bg-[#F5F1ED] border-[#D4CEC5] hover:bg-[#EAE6E2]"
                style={{
                  background: '#F5F1ED',
                  boxShadow: 'inset 2px 2px 5px rgba(166, 150, 130, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.5)',
                }}
              >
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {selectedOrg?.logo_url && (
                      <Avatar className="h-5 w-5 rounded">
                        <AvatarImage src={selectedOrg.logo_url} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {selectedOrg.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span className="truncate">{selectedOrg?.name || 'Select organization'}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white border-[#D4CEC5] text-[#3A3530]">
                {userOrgs.map((org) => (
                  <SelectItem 
                    key={org.id} 
                    value={org.id}
                    className="text-[#3A3530] focus:bg-[#F5F1ED] focus:text-[#3A3530]"
                  >
                    <div className="flex items-center gap-2">
                      {org.logo_url && (
                        <Avatar className="h-5 w-5 rounded">
                          <AvatarImage src={org.logo_url} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {org.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <span>{org.name}</span>
                      {org.role === 'owner' && (
                        <Badge variant="secondary" className="ml-2 text-xs bg-primary/10 text-primary border-primary/20">
                          Owner
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {canCreateBusinessPosts && (
            <Button 
              onClick={() => openComposer()} 
              className="flex items-center gap-2 text-white bg-[#3A3530] hover:bg-[#2A2520]"
              style={{
                boxShadow: '8px 8px 16px rgba(166, 150, 130, 0.3), -8px -8px 16px rgba(255, 255, 255, 0.85)'
              }}
            >
              <Plus className="h-4 w-4" />
              Create Business Insight
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="border-0"
          style={{
            background: '#EAE6E2',
            boxShadow: '8px 8px 20px rgba(166, 150, 130, 0.3), -8px -8px 20px rgba(255, 255, 255, 0.85)',
            borderRadius: '24px'
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              {orgLogoSignedUrl ? (
                <div className="h-8 w-8 rounded-lg overflow-hidden flex-shrink-0" style={{
                  background: '#F5F1ED',
                  boxShadow: 'inset 2px 2px 5px rgba(166, 150, 130, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.5)',
                }}>
                  <img 
                    src={orgLogoSignedUrl} 
                    alt={`${currentOrganization?.name || 'Organization'} logo`}
                    className="w-full h-full object-cover"
                    onError={() => setOrgLogoSignedUrl(null)}
                  />
                </div>
              ) : currentOrganization?.name ? (
                <div 
                  className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #D4A574 0%, #B8865A 100%)',
                    color: '#FFFFFF',
                  }}
                >
                  {currentOrganization.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <Building2 className="h-8 w-8 text-primary flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-[#6B635B]">Company</p>
                  {isOrgOwner && (
                    <Badge variant="default" className="bg-primary/20 text-primary border-primary/30 text-xs">
                      Owner
                    </Badge>
                  )}
                </div>
                <p className="text-lg font-semibold text-[#3A3530]">{currentOrganization?.name || profile?.company_name || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border-0"
          style={{
            background: '#EAE6E2',
            boxShadow: '8px 8px 20px rgba(166, 150, 130, 0.3), -8px -8px 20px rgba(255, 255, 255, 0.85)',
            borderRadius: '24px'
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-[#6B635B]">Team Size</p>
                <p className="text-lg font-semibold text-[#3A3530]">{profile?.company_size || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border-0"
          style={{
            background: '#EAE6E2',
            boxShadow: '8px 8px 20px rgba(166, 150, 130, 0.3), -8px -8px 20px rgba(255, 255, 255, 0.85)',
            borderRadius: '24px'
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-[#6B635B]">Insights Posted</p>
                <p className="text-lg font-semibold text-[#3A3530]">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border-0"
          style={{
            background: '#EAE6E2',
            boxShadow: '8px 8px 20px rgba(166, 150, 130, 0.3), -8px -8px 20px rgba(255, 255, 255, 0.85)',
            borderRadius: '24px'
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-[#6B635B]">Total Views</p>
                <p className="text-lg font-semibold text-[#3A3530]">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        const newParams = new URLSearchParams(searchParams);
        newParams.set('tab', value);
        navigate(`/business-dashboard?${newParams.toString()}`, { replace: true });
      }} className="space-y-6">
        <TabsList 
          className="grid w-full grid-cols-4 text-[#6B635B]"
          style={{
            background: '#EAE6E2',
            boxShadow: 'inset 4px 4px 10px rgba(166, 150, 130, 0.2), inset -4px -4px 10px rgba(255, 255, 255, 0.6)',
            borderRadius: '16px',
            padding: '4px'
          }}
        >
          <TabsTrigger 
            value="overview"
            className="!text-[#6B635B] data-[state=active]:bg-white data-[state=active]:!text-[#3A3530] data-[state=active]:shadow-sm"
            style={{ borderRadius: '12px', color: '#6B635B' }}
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="insights"
            className="!text-[#6B635B] data-[state=active]:bg-white data-[state=active]:!text-[#3A3530] data-[state=active]:shadow-sm"
            style={{ borderRadius: '12px', color: '#6B635B' }}
          >
            My Insights
          </TabsTrigger>
          <TabsTrigger 
            value="team"
            className="!text-[#6B635B] data-[state=active]:bg-white data-[state=active]:!text-[#3A3530] data-[state=active]:shadow-sm"
            style={{ borderRadius: '12px', color: '#6B635B' }}
          >
            Team Management
          </TabsTrigger>
          <TabsTrigger 
            value="settings"
            className="!text-[#6B635B] data-[state=active]:bg-white data-[state=active]:!text-[#3A3530] data-[state=active]:shadow-sm"
            style={{ borderRadius: '12px', color: '#6B635B' }}
          >
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card 
              className="border-0"
              style={{
                background: '#EAE6E2',
                boxShadow: '8px 8px 20px rgba(166, 150, 130, 0.3), -8px -8px 20px rgba(255, 255, 255, 0.85)',
                borderRadius: '24px'
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#3A3530]">
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <p className="text-[#6B635B] text-center py-8">Loading...</p>
                ) : recentActivityInsights.length === 0 ? (
                  <p className="text-[#6B635B] text-center py-8">
                    No recent activity to display
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentActivityInsights.map((insight) => (
                      <div
                        key={insight.id}
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent('pb:brainstorm:show-thread', {
                              detail: { postId: insight.id },
                            })
                          );
                        }}
                        className="p-3 rounded-xl bg-[#EAE6E2] cursor-pointer transition-all"
                        style={{
                          boxShadow: '8px 8px 16px rgba(166, 150, 130, 0.3), -8px -8px 16px rgba(255, 255, 255, 0.85)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = 'inset 6px 6px 12px rgba(166, 150, 130, 0.4), inset -6px -6px 12px rgba(255, 255, 255, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = '8px 8px 16px rgba(166, 150, 130, 0.3), -8px -8px 16px rgba(255, 255, 255, 0.85)';
                        }}
                      >
                        {insight.title && (
                          <h4 className="font-semibold mb-1.5 text-[#3A3530] text-sm line-clamp-1">
                            {insight.title}
                          </h4>
                        )}
                        <p className="text-[#6B635B] text-xs line-clamp-2 mb-2">
                          {insight.content}
                        </p>
                        <div className="text-xs text-[#6B635B]/70">
                          {new Date(insight.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card 
              className="border-0"
              style={{
                background: '#EAE6E2',
                boxShadow: '8px 8px 20px rgba(166, 150, 130, 0.3), -8px -8px 20px rgba(255, 255, 255, 0.85)',
                borderRadius: '24px'
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#3A3530]">
                  <Settings className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => openComposer()} 
                  className="w-full justify-start text-[#3A3530]"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Business Insight
                </Button>
                <Button 
                  className="w-full justify-start text-[#3A3530]" 
                  variant="outline"
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('tab', 'settings');
                    setActiveTab('settings');
                    navigate(`/business-dashboard?${newParams.toString()}`, { replace: true });
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Business Settings
                </Button>
                <Button 
                  className="w-full justify-start text-[#3A3530]" 
                  variant="outline"
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('tab', 'team');
                    setActiveTab('team');
                    navigate(`/business-dashboard?${newParams.toString()}`, { replace: true });
                  }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Team Invitations
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Business Benefits */}
          <Card 
            className="border-0"
            style={{
              background: '#EAE6E2',
              boxShadow: '8px 8px 20px rgba(166, 150, 130, 0.3), -8px -8px 20px rgba(255, 255, 255, 0.85)',
              borderRadius: '24px'
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#3A3530]">
                <Crown className="h-5 w-5 text-yellow-500" />
                Business Member Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2 text-[#3A3530]">
                    <Eye className="h-4 w-4" />
                    Content Creation
                  </h4>
                  <ul className="text-sm text-[#6B635B] space-y-1">
                    <li>• Post Business Insights with privacy controls</li>
                    <li>• Share industry reports and whitepapers</li>
                    <li>• Create webinars and video content</li>
                    <li>• Target specific industries and departments</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2 text-[#3A3530]">
                    <Users className="h-4 w-4" />
                    Team Management
                  </h4>
                  <ul className="text-sm text-[#6B635B] space-y-1">
                    <li>• Invite team members to your business</li>
                    <li>• Manage business member roles</li>
                    <li>• Control content permissions</li>
                    {isAdminRole && <li>• Admin privileges for approvals</li>}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card 
            className="border-0"
            style={{
              background: '#EAE6E2',
              boxShadow: '8px 8px 20px rgba(166, 150, 130, 0.3), -8px -8px 20px rgba(255, 255, 255, 0.85)',
              borderRadius: '24px'
            }}
          >
            <CardHeader>
              <CardTitle className="text-[#3A3530]">My Business Insights</CardTitle>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <p className="text-[#6B635B] text-center py-8">Loading insights...</p>
              ) : businessInsights.length === 0 ? (
                <p className="text-[#6B635B] text-center py-8">
                  No business insights posted yet. 
                  <Button 
                    variant="link" 
                    onClick={() => openComposer()}
                    className="ml-1 p-0 h-auto"
                  >
                    Create your first insight
                  </Button>
                </p>
              ) : (
                <div className="space-y-4">
                  {businessInsights.map((insight) => (
                    <div
                      key={insight.id}
                      onClick={() => {
                        window.dispatchEvent(
                          new CustomEvent('pb:brainstorm:show-thread', {
                            detail: { postId: insight.id },
                          })
                        );
                      }}
                      className="p-4 rounded-xl bg-[#EAE6E2] cursor-pointer transition-all"
                      style={{
                        boxShadow: '8px 8px 16px rgba(166, 150, 130, 0.3), -8px -8px 16px rgba(255, 255, 255, 0.85)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = 'inset 6px 6px 12px rgba(166, 150, 130, 0.4), inset -6px -6px 12px rgba(255, 255, 255, 0.6)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '8px 8px 16px rgba(166, 150, 130, 0.3), -8px -8px 16px rgba(255, 255, 255, 0.85)';
                      }}
                    >
                      {insight.title && (
                        <h3 className="font-semibold mb-2 text-[#3A3530]">{insight.title}</h3>
                      )}
                      <p className="text-[#6B635B]">{insight.content}</p>
                      <div className="mt-2 text-xs text-[#6B635B]">
                        {new Date(insight.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <BusinessInvitations />
        </TabsContent>

        <TabsContent value="settings">
          {orgsLoading ? (
            <Card 
              className="border-0"
              style={{
                background: '#EAE6E2',
                boxShadow: '8px 8px 20px rgba(166, 150, 130, 0.3), -8px -8px 20px rgba(255, 255, 255, 0.85)',
                borderRadius: '24px'
              }}
            >
              <CardContent className="p-8 text-center">
                <div className="text-[#6B635B]">Loading organizations...</div>
              </CardContent>
            </Card>
          ) : (
            <OrganizationProfileForm
              key={selectedOrgIdState || 'no-org'}
              orgId={selectedOrgIdState || undefined}
              isReadOnly={isReadOnly}
              onSuccess={() => {
                // Optionally show success message or refresh data
              }}
            />
          )}
        </TabsContent>
      </Tabs>
      </div>
      
      <PostReaderModal
        isOpen={!!readerModalPost}
        onClose={() => setReaderModalPost(null)}
        post={readerModalPost}
      />
    </div>
  );
}

export default BusinessDashboard;