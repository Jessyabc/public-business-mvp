import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { BusinessInvitations } from '@/components/business/BusinessInvitations';
import { useComposerStore } from '@/hooks/useComposerStore';
import { BusinessMemberBadge } from '@/components/business/BusinessMemberBadge';
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
  const { isBusinessMember, isAdmin, canCreateBusinessPosts } = useUserRoles();
  const { profile } = useBusinessProfile();
  const { openComposer } = useComposerStore();

  const isBusinessMemberRole = isBusinessMember() || isAdmin();
  const isAdminRole = isAdmin();

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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Business Dashboard</h1>
            <BusinessMemberBadge />
          </div>
          {profile && (
            <p className="text-muted-foreground">
              Welcome back to {profile.company_name}
            </p>
          )}
        </div>
        
        {canCreateBusinessPosts && (
          <Button onClick={() => openComposer()} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Business Insight
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Company</p>
                <p className="text-lg font-semibold">{profile?.company_name || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Size</p>
                <p className="text-lg font-semibold">{profile?.company_size || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Insights Posted</p>
                <p className="text-lg font-semibold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-lg font-semibold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">My Insights</TabsTrigger>
          <TabsTrigger value="team">Team Management</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  No recent activity to display
                </p>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => openComposer()} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Business Insight
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <a href="/business-profile">
                    <Building2 className="h-4 w-4 mr-2" />
                    Edit Business Profile
                  </a>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <a href="/business-membership">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Team Invitations
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Business Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Business Member Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Content Creation
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Post Business Insights with privacy controls</li>
                    <li>• Share industry reports and whitepapers</li>
                    <li>• Create webinars and video content</li>
                    <li>• Target specific industries and departments</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Team Management
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
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
          <Card>
            <CardHeader>
              <CardTitle>My Business Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                No business insights posted yet. 
                <Button 
                  variant="link" 
                  onClick={() => openComposer()}
                  className="ml-1 p-0 h-auto"
                >
                  Create your first insight
                </Button>
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <BusinessInvitations />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Business Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button asChild variant="outline">
                  <a href="/business-profile">Edit Business Profile</a>
                </Button>
                {isAdminRole && (
                  <div className="space-y-2">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Crown className="h-3 w-3 mr-1" />
                      Admin Privileges
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      As a business admin, you can approve posts and manage team members.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
}

export default BusinessDashboard;