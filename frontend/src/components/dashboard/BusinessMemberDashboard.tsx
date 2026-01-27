import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { useProfile } from '@/hooks/useProfile';
import { useOrgAnalytics } from '@/hooks/useBusinessAnalytics';
import { useUserOrgId } from '@/features/orgs/hooks/useUserOrgId';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  TrendingUp, 
  Users, 
  FileText, 
  Eye, 
  MessageSquare, 
  Share2,
  Target,
  BarChart3,
  DollarSign,
  Calendar,
  Award,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

export function BusinessMemberDashboard() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { profile: businessProfile } = useBusinessProfile();
  const { data: orgId } = useUserOrgId();
  const { data: orgAnalytics, isLoading: analyticsLoading } = useOrgAnalytics(orgId);
  const navigate = useNavigate();

  // Initial default values - will be replaced with real data from posts
  const businessStats = {
    uScore: 0,
    activePosts: 0,
    totalViews: 0,
    totalEngagement: 0,
    monthlyGrowth: 0,
    reportDownloads: 0,
    followerCount: 0,
    impressions: 0,
    avgEngagementRate: 0,
    thisMonthPosts: 0,
    pendingInvitations: 0,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {businessProfile?.company_name || profile?.display_name || 'Business'}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's your business dashboard overview and performance metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="default" className="px-4 py-2">
            <Building2 className="h-4 w-4 mr-2" />
            Business Member
          </Badge>
          <Badge variant="secondary">
            U-Score: {businessStats.uScore}
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-business-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Posts</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{businessStats.activePosts}</div>
              <p className="text-xs text-muted-foreground">+{businessStats.thisMonthPosts} this month</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-business-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {businessStats.totalViews.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +{businessStats.monthlyGrowth}% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-business-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement</CardTitle>
              <MessageSquare className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{businessStats.totalEngagement}</div>
              <p className="text-xs text-muted-foreground">Avg. {businessStats.avgEngagementRate}% rate</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-business-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Followers</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{businessStats.followerCount}</div>
              <p className="text-xs text-muted-foreground">{businessStats.impressions.toLocaleString()} impressions</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-1"
        >
          <Card className="glass-business-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold">{businessProfile?.company_name || 'Your Company'}</h3>
                <p className="text-sm text-muted-foreground">{businessProfile?.company_size || 'Company Size'}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">U-Score</span>
                  <span className="font-medium text-blue-600">{businessStats.uScore}</span>
                </div>
                <Progress value={businessStats.uScore} className="h-2" />
                
                <div className="flex justify-between">
                  <span className="text-sm">Report Downloads</span>
                  <span className="font-medium">{businessStats.reportDownloads}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pending Invites</span>
                  <span className="font-medium">{businessStats.pendingInvitations}</span>
                </div>
              </div>

              <Button className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Invite Team Members
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card className="glass-business-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Posts
              </CardTitle>
              <Button size="sm">
                <FileText className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No posts yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start creating business insights and reports to see them here
                </p>
                <Button size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Create Your First Post
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Analytics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="glass-business-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground/30 mb-4 animate-pulse" />
                <p className="text-sm text-muted-foreground">Loading analytics...</p>
              </div>
            ) : orgAnalytics && orgAnalytics.total_insights > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-blue-600">{orgAnalytics.total_insights}</div>
                    <div className="text-xs text-muted-foreground mt-1">Total Insights</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-green-600">
                      {orgAnalytics.avg_u_score?.toFixed(1) || '0.0'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Avg U-Score</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-purple-600">{orgAnalytics.total_continuations}</div>
                    <div className="text-xs text-muted-foreground mt-1">Continuations</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-orange-600">{orgAnalytics.total_views || 0}</div>
                    <div className="text-xs text-muted-foreground mt-1">Total Views</div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/business-dashboard')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Full Analytics
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">Start posting to see analytics</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first business insight to unlock performance metrics and analytics.
                </p>
                <Button 
                  onClick={() => {
                    // Open composer or navigate to create post
                    const event = new CustomEvent('open-composer', { detail: { mode: 'business' } });
                    window.dispatchEvent(event);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Insight
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="glass-business-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Button className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Create Post
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Invite Members
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                View Analytics
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Investor Reports
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule Post
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}