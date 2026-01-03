import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserRoles } from '@/hooks/useUserRoles';
import { BusinessProfileForm } from '@/components/business/BusinessProfileForm';
import { useIsOrgOwner } from '@/hooks/useOrgMembership';
import { useUserOrgId } from '@/features/orgs/hooks/useUserOrgId';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building2, 
  Settings, 
  Shield,
  Eye,
  Users,
  ArrowLeft,
  Globe,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface TeamMember {
  user_id: string;
  role: string;
  created_at: string;
  profile: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function BusinessSettings() {
  const { isBusinessMember, isAdmin } = useUserRoles();
  const { isOrgOwner } = useIsOrgOwner();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const { data: orgId } = useUserOrgId();
  
  // Fetch team members
  const { data: teamMembers, isLoading: teamLoading } = useQuery<TeamMember[]>({
    queryKey: ['org-members', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      
      // Fetch org members
      const { data: members, error: membersError } = await supabase
        .from('org_members')
        .select('user_id, role, created_at')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });
      
      if (membersError) {
        console.error('Error fetching team members:', membersError);
        return [];
      }
      
      if (!members || members.length === 0) return [];
      
      // Fetch profiles for all user IDs
      const userIds = members.map(m => m.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds);
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }
      
      // Combine members with profiles
      const profileMap = new Map((profiles || []).map(p => [p.id, p]));
      return members.map(member => ({
        ...member,
        profile: profileMap.get(member.user_id) || null,
      }));
    },
    enabled: !!orgId,
  });

  const isBusinessMemberRole = isBusinessMember() || isAdmin();
  const isAdminRole = isAdmin();
  const isReadOnly = !isOrgOwner && !isAdminRole;

  if (!isBusinessMemberRole) {
    return (
      <ProtectedRoute requireAuth={true}>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Business Access Required</h2>
              <p className="text-muted-foreground mb-4">
                You need to be a Business Member to access this page.
              </p>
              <Button asChild>
                <a href="/create-business">Create Business</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <div 
        className="min-h-screen"
        style={{
          background: '#EAE6E2',
          padding: '1.5rem'
        }}
      >
        <div className="container mx-auto max-w-5xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/business-dashboard')}
                className="rounded-full"
                style={{
                  background: '#EAE6E2',
                  boxShadow: '4px 4px 10px rgba(166, 150, 130, 0.2), -4px -4px 10px rgba(255, 255, 255, 0.6)',
                }}
              >
                <ArrowLeft className="h-5 w-5 text-[#3A3530]" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-[#3A3530]">Business Settings</h1>
                <p className="text-[#6B635B] mt-1">
                  Manage your organization profile and settings
                </p>
              </div>
            </div>
            {isOrgOwner && (
              <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
                Owner
              </Badge>
            )}
            {isAdminRole && !isOrgOwner && (
              <Badge variant="secondary" className="bg-muted text-muted-foreground">
                Admin
              </Badge>
            )}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2" style={{
              background: '#EAE6E2',
              boxShadow: 'inset 4px 4px 10px rgba(166, 150, 130, 0.2), inset -4px -4px 10px rgba(255, 255, 255, 0.6)',
              borderRadius: '16px',
              padding: '4px'
            }}>
              <TabsTrigger 
                value="profile"
                className="data-[state=active]:bg-white data-[state=active]:text-[#3A3530] data-[state=active]:shadow-sm"
                style={{
                  borderRadius: '12px'
                }}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Organization Profile
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="data-[state=active]:bg-white data-[state=active]:text-[#3A3530] data-[state=active]:shadow-sm"
                style={{
                  borderRadius: '12px'
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card 
                className="border-0"
                style={{
                  background: '#EAE6E2',
                  boxShadow: '8px 8px 20px rgba(166, 150, 130, 0.3), -8px -8px 20px rgba(255, 255, 255, 0.85)',
                  borderRadius: '24px'
                }}
              >
                <CardHeader>
                  <CardTitle className="text-[#3A3530] flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Organization Information
                  </CardTitle>
                  <CardDescription className="text-[#6B635B]">
                    {isReadOnly 
                      ? 'View your organization information (read-only)' 
                      : 'Update your organization details and company information.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BusinessProfileForm 
                    compact={false} 
                    isReadOnly={isReadOnly}
                    onSuccess={() => {
                      // Optionally show success message or refresh data
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card 
                className="border-0"
                style={{
                  background: '#EAE6E2',
                  boxShadow: '8px 8px 20px rgba(166, 150, 130, 0.3), -8px -8px 20px rgba(255, 255, 255, 0.85)',
                  borderRadius: '24px'
                }}
              >
                <CardHeader>
                  <CardTitle className="text-[#3A3530] flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy & Visibility
                  </CardTitle>
                  <CardDescription className="text-[#6B635B]">
                    Control who can see your organization and content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{
                      background: '#EAE6E2',
                      boxShadow: 'inset 2px 2px 5px rgba(166, 150, 130, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.6)',
                    }}>
                      <div className="flex items-center gap-3">
                        <Eye className="h-5 w-5 text-[#6B635B]" />
                        <div>
                          <p className="font-medium text-[#3A3530]">Public Profile</p>
                          <p className="text-sm text-[#6B635B]">Make your organization visible to everyone</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Enabled
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{
                      background: '#EAE6E2',
                      boxShadow: 'inset 2px 2px 5px rgba(166, 150, 130, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.6)',
                    }}>
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-[#6B635B]" />
                        <div>
                          <p className="font-medium text-[#3A3530]">Content Visibility Default</p>
                          <p className="text-sm text-[#6B635B]">Default visibility for new posts and insights</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Public
                      </Badge>
                    </div>
                  </div>
                  
                  {isReadOnly && (
                    <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        <Shield className="h-4 w-4 inline mr-2" />
                        Only organization owners can modify these settings.
                      </p>
                    </div>
                  )}
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
                <CardHeader>
                  <CardTitle className="text-[#3A3530] flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Management
                  </CardTitle>
                  <CardDescription className="text-[#6B635B]">
                    Manage team members and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Team Members List */}
                  {teamLoading ? (
                    <div className="text-center py-4 text-[#6B635B]">Loading team members...</div>
                  ) : teamMembers && teamMembers.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="font-medium text-[#3A3530] mb-3">Team Members ({teamMembers.length})</h4>
                      {teamMembers.map((member) => (
                        <div 
                          key={member.user_id}
                          className="flex items-center justify-between p-3 rounded-lg" 
                          style={{
                            background: '#EAE6E2',
                            boxShadow: 'inset 2px 2px 5px rgba(166, 150, 130, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.6)',
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.profile?.avatar_url || undefined} />
                              <AvatarFallback>
                                {member.profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-[#3A3530] text-sm">
                                {member.profile?.display_name || 'Unknown User'}
                              </p>
                              <p className="text-xs text-[#6B635B] capitalize">{member.role}</p>
                            </div>
                          </div>
                          {member.role === 'owner' && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                              Owner
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-[#6B635B] text-sm">
                      No team members found
                    </div>
                  )}
                  
                  <Button 
                    asChild 
                    variant="outline" 
                    className="w-full justify-start mt-4"
                    style={{
                      background: '#EAE6E2',
                      boxShadow: '4px 4px 10px rgba(166, 150, 130, 0.2), -4px -4px 10px rgba(255, 255, 255, 0.6)',
                    }}
                  >
                    <a href="/business-membership">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Team Invitations
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default BusinessSettings;


