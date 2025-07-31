import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Share2, 
  TrendingUp,
  Calendar,
  MapPin,
  Award,
  Bookmark
} from 'lucide-react';

export function Community() {
  const communityStats = [
    { label: 'Active Members', value: '12,847', change: '+8%', icon: Users, color: 'blue' },
    { label: 'Discussions Today', value: '342', change: '+15%', icon: MessageCircle, color: 'green' },
    { label: 'Ideas Shared', value: '8,924', change: '+12%', icon: TrendingUp, color: 'purple' },
    { label: 'Events This Week', value: '28', change: '+3%', icon: Calendar, color: 'orange' },
  ];

  const activeDiscussions = [
    {
      id: 1,
      title: 'The Future of Remote Work: Challenges and Opportunities',
      author: 'Sarah Chen',
      avatar: '/api/placeholder/40/40',
      replies: 47,
      likes: 128,
      timestamp: '2 hours ago',
      category: 'Business',
      isHot: true
    },
    {
      id: 2,
      title: 'Sustainable Technology Solutions for Small Businesses',
      author: 'Mike Rodriguez',
      avatar: '/api/placeholder/40/40',
      replies: 31,
      likes: 89,
      timestamp: '4 hours ago',
      category: 'Technology',
      isHot: false
    },
    {
      id: 3,
      title: 'Creative Brainstorming: Breaking Through Mental Blocks',
      author: 'Emma Watson',
      avatar: '/api/placeholder/40/40',
      replies: 63,
      likes: 156,
      timestamp: '6 hours ago',
      category: 'Innovation',
      isHot: true
    },
  ];

  const topContributors = [
    { name: 'Alex Thompson', contributions: 247, badge: 'Expert', avatar: '/api/placeholder/40/40' },
    { name: 'Jessica Liu', contributions: 198, badge: 'Innovator', avatar: '/api/placeholder/40/40' },
    { name: 'David Park', contributions: 176, badge: 'Mentor', avatar: '/api/placeholder/40/40' },
    { name: 'Rachel Green', contributions: 154, badge: 'Pioneer', avatar: '/api/placeholder/40/40' },
  ];

  const upcomingEvents = [
    {
      title: 'Weekly Innovation Spotlight',
      date: 'Tomorrow, 2:00 PM',
      attendees: 89,
      type: 'Virtual',
      category: 'Innovation'
    },
    {
      title: 'Business Strategy Roundtable',
      date: 'Friday, 10:00 AM',
      attendees: 45,
      type: 'Virtual',
      category: 'Business'
    },
    {
      title: 'Tech Talk: AI in Everyday Life',
      date: 'Monday, 3:00 PM',
      attendees: 156,
      type: 'Virtual',
      category: 'Technology'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10" />
        <div className="relative px-6 py-16 text-center">
          <div className="glass-card w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mx-auto mb-6 border border-purple-200/30">
            <Users className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Community Hub
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Connect, collaborate, and grow with a vibrant community of innovators, entrepreneurs, and thought leaders.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Community Stats */}
        <section className="animate-scale-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {communityStats.map((stat) => (
              <Card key={stat.label} className="glass-card border-white/20 bg-white/40 backdrop-blur-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`glass-card w-10 h-10 rounded-full bg-${stat.color}-100/50 flex items-center justify-center border border-${stat.color}-200/30`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                    </div>
                    <Badge variant="secondary" className="glass-card bg-green-100/50 text-green-700 border-green-200/30">
                      {stat.change}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Active Discussions */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-green-600" />
                Active Discussions
              </h2>
              <Button variant="outline" className="glass-card border-white/30 bg-white/20 hover:bg-white/30">
                View All
              </Button>
            </div>
            
            <div className="space-y-4">
              {activeDiscussions.map((discussion) => (
                <Card key={discussion.id} className="glass-card border-white/20 bg-white/40 backdrop-blur-xl hover-scale cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={discussion.avatar} />
                          <AvatarFallback>{discussion.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{discussion.author}</span>
                            {discussion.isHot && (
                              <Badge variant="secondary" className="glass-card bg-red-100/50 text-red-700 border-red-200/30 text-xs">
                                Hot
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-slate-500">{discussion.timestamp}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="glass-card bg-blue-100/50 text-blue-700 border-blue-200/30">
                        {discussion.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg text-slate-900 hover:text-blue-600 cursor-pointer">
                      {discussion.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {discussion.replies} replies
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {discussion.likes} likes
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="hover:bg-white/20">
                          <Bookmark className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="hover:bg-white/20">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8 animate-scale-in">
            {/* Top Contributors */}
            <Card className="glass-card border-white/20 bg-white/40 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Top Contributors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topContributors.map((contributor, index) => (
                  <div key={contributor.name} className="flex items-center gap-3">
                    <div className="text-sm font-bold text-slate-500 w-6">#{index + 1}</div>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={contributor.avatar} />
                      <AvatarFallback>{contributor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 text-sm">{contributor.name}</div>
                      <div className="text-xs text-slate-600">{contributor.contributions} contributions</div>
                    </div>
                    <Badge variant="secondary" className="glass-card bg-yellow-100/50 text-yellow-700 border-yellow-200/30 text-xs">
                      {contributor.badge}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="glass-card border-white/20 bg-white/40 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.title} className="p-4 glass-card bg-white/30 rounded-lg border border-white/20">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="glass-card bg-blue-100/50 text-blue-700 border-blue-200/30 text-xs">
                        {event.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <MapPin className="w-3 h-3" />
                        {event.type}
                      </div>
                    </div>
                    <h4 className="font-medium text-slate-900 text-sm mb-1">{event.title}</h4>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>{event.date}</span>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {event.attendees}
                      </div>
                    </div>
                  </div>
                ))}
                <Button className="w-full glass-card bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 text-white">
                  View All Events
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Community;