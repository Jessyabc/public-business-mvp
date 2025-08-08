import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Brain, MessageSquare, TrendingUp, Target, Star, Award, Users, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export function PublicMemberDashboard() {
  const { user } = useAuth();
  const { profile } = useProfile();

  // Mock data - in real app, fetch from your API
  const userStats = {
    tScore: 75,
    uScore: 82,
    brainstormsContributed: 12,
    totalInteractions: 248,
    activeBrainstorms: 5,
    completedBrainstorms: 7,
    influence: 'Growing',
    rankThisWeek: 3,
    industryContributions: [
      { name: 'Technology', count: 5, score: 85 },
      { name: 'Healthcare', count: 3, score: 72 },
      { name: 'Finance', count: 4, score: 78 },
    ]
  };

  const recentActivity = [
    { 
      type: 'brainstorm', 
      title: 'Contributing to "Sustainable Manufacturing"', 
      time: '2 hours ago',
      score: '+5 T-Score'
    },
    { 
      type: 'comment', 
      title: 'Replied to automation discussion', 
      time: '5 hours ago',
      score: '+2 U-Score'
    },
    { 
      type: 'like', 
      title: 'Your idea gained 10 new likes', 
      time: '1 day ago',
      score: '+3 T-Score'
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {profile?.display_name || 'Member'}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's your public engagement overview and recent activity.
          </p>
        </div>
        <Badge variant="secondary" className="px-4 py-2">
          <Users className="h-4 w-4 mr-2" />
          Public Member
        </Badge>
      </div>

      {/* Score Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">T-Score</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{userStats.tScore}</div>
              <p className="text-xs text-muted-foreground">Thought Leadership</p>
              <Progress value={userStats.tScore} className="mt-2" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">U-Score</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{userStats.uScore}</div>
              <p className="text-xs text-muted-foreground">Utility Score</p>
              <Progress value={userStats.uScore} className="mt-2" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Brainstorms</CardTitle>
              <Brain className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.brainstormsContributed}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interactions</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.totalInteractions}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-1"
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Profile Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <Badge variant="secondary" className="mb-2">
                  Rank #{userStats.rankThisWeek} This Week
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Influence Status: <span className="text-green-600 font-medium">{userStats.influence}</span>
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Active Brainstorms</span>
                  <span className="font-medium">{userStats.activeBrainstorms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Completed</span>
                  <span className="font-medium">{userStats.completedBrainstorms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Industries</span>
                  <span className="font-medium">{userStats.industryContributions.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        {activity.type === 'brainstorm' && <Brain className="h-4 w-4 text-primary" />}
                        {activity.type === 'comment' && <MessageSquare className="h-4 w-4 text-blue-500" />}
                        {activity.type === 'like' && <Star className="h-4 w-4 text-yellow-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      {activity.score}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Industry Contributions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Industry Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {userStats.industryContributions.map((industry, index) => (
                <div key={index} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{industry.name}</h3>
                    <Badge variant="secondary">{industry.count}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Impact Score</span>
                      <span className="font-medium">{industry.score}</span>
                    </div>
                    <Progress value={industry.score} className="h-2" />
                  </div>
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
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                New Brainstorm
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Join Discussion
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                View Goals
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}