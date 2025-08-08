import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { useProfile } from '@/hooks/useProfile';
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
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';

export function BusinessMemberDashboard() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { profile: businessProfile } = useBusinessProfile();

  // Mock data - in real app, fetch from your API
  const businessStats = {
    uScore: 89,
    activePosts: 8,
    totalViews: 1247,
    totalEngagement: 324,
    monthlyGrowth: 12.5,
    reportDownloads: 45,
    followerCount: 189,
    impressions: 5420,
    avgEngagementRate: 4.2,
    thisMonthPosts: 12,
    pendingInvitations: 3,
  };

  const recentPosts = [
    {
      title: "Q3 Market Analysis Report",
      type: "report",
      views: 156,
      engagement: 23,
      date: "2 days ago",
      status: "published"
    },
    {
      title: "Industry Insights: AI in Manufacturing",
      type: "insight",
      views: 89,
      engagement: 15,
      date: "5 days ago",
      status: "published"
    },
    {
      title: "Sustainability Initiative Update",
      type: "update",
      views: 203,
      engagement: 31,
      date: "1 week ago",
      status: "published"
    }
  ];

  const analyticsData = [
    { metric: "Post Reach", value: "2.3K", change: "+15%" },
    { metric: "Profile Views", value: "456", change: "+8%" },
    { metric: "Engagement Rate", value: "4.2%", change: "+12%" },
    { metric: "Report Downloads", value: "45", change: "+23%" },
  ];

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
              <div className="space-y-4">
                {recentPosts.map((post, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-blue-50/50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{post.title}</h4>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{post.date}</span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {post.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" /> {post.engagement}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {post.status}
                    </Badge>
                  </div>
                ))}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {analyticsData.map((item, index) => (
                <div key={index} className="text-center p-4 bg-blue-50/30 rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground">{item.metric}</h3>
                  <div className="text-2xl font-bold text-blue-600 my-2">{item.value}</div>
                  <Badge variant="secondary" className="text-green-600">
                    {item.change}
                  </Badge>
                </div>
              ))}
            </div>
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