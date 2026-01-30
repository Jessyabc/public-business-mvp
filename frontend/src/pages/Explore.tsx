import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Compass, 
  TrendingUp, 
  Users, 
  Lightbulb, 
  Star, 
  ArrowRight,
  Brain,
  Zap,
  Target
} from 'lucide-react';

export function Explore() {
  const trendingTopics = [
    { title: 'AI & Machine Learning', count: 2847, trend: '+15%', color: 'blue' },
    { title: 'Sustainability', count: 1923, trend: '+8%', color: 'green' },
    { title: 'Digital Transformation', count: 1654, trend: '+12%', color: 'purple' },
    { title: 'Remote Work', count: 1432, trend: '+5%', color: 'orange' },
    { title: 'Blockchain', count: 1298, trend: '+22%', color: 'indigo' },
  ];

  const featuredSessions = [
    {
      title: 'Future of Sustainable Technology',
      description: 'Exploring eco-friendly innovations shaping tomorrow',
      participants: 89,
      rating: 4.8,
      category: 'Technology',
      duration: '45 min'
    },
    {
      title: 'Remote Team Collaboration Strategies',
      description: 'Best practices for managing distributed teams',
      participants: 156,
      rating: 4.9,
      category: 'Business',
      duration: '60 min'
    },
    {
      title: 'Creative Problem Solving Techniques',
      description: 'Unlock your creative potential with proven methods',
      participants: 203,
      rating: 4.7,
      category: 'Innovation',
      duration: '30 min'
    },
  ];

  const categories = [
    { name: 'Innovation', icon: Lightbulb, count: 1247, color: 'yellow' },
    { name: 'Business Strategy', icon: Target, count: 986, color: 'blue' },
    { name: 'Technology', icon: Zap, count: 1654, color: 'purple' },
    { name: 'Leadership', icon: Users, count: 823, color: 'green' },
  ];

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-muted/20" />
        <div className="relative px-6 py-16 text-center">
          <div className="glass-card w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6 border border-accent/30">
            <Compass className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Explore & Discover
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Discover trending topics, join engaging discussions, and connect with like-minded innovators from around the world.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Trending Topics */}
        <section className="animate-scale-in">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                Trending Topics
              </h2>
              <p className="text-slate-600 mt-1">What's capturing attention right now</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingTopics.map((topic, index) => (
              <Card key={topic.title} className="glass-card border-white/20 bg-white/40 backdrop-blur-xl hover-scale cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className={`glass-card bg-${topic.color}-100/50 text-${topic.color}-700 border-${topic.color}-200/30`}>
                      {topic.trend}
                    </Badge>
                    <span className="text-sm text-slate-500">#{index + 1}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{topic.title}</h3>
                  <p className="text-sm text-slate-600">{topic.count.toLocaleString()} discussions</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="animate-fade-in">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            Browse Categories
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Card key={category.name} className="glass-card border-white/20 bg-white/40 backdrop-blur-xl hover-scale cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className={`glass-card w-12 h-12 rounded-full bg-${category.color}-100/50 flex items-center justify-center mx-auto mb-4 border border-${category.color}-200/30`}>
                    <category.icon className={`w-6 h-6 text-${category.color}-600`} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-slate-600">{category.count} topics</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Sessions */}
        <section className="animate-scale-in">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                Featured Sessions
              </h2>
              <p className="text-slate-600 mt-1">Highly rated brainstorming sessions you might enjoy</p>
            </div>
            <Button variant="outline" className="glass-card border-white/30 bg-white/20 hover:bg-white/30">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSessions.map((session) => (
              <Card key={session.title} className="glass-card border-white/20 bg-white/40 backdrop-blur-xl hover-scale cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="glass-card bg-blue-100/50 text-blue-700 border-blue-200/30">
                      {session.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-slate-700">{session.rating}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg text-slate-900">{session.title}</CardTitle>
                  <CardDescription className="text-slate-600">{session.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {session.participants} participants
                    </div>
                    <span>{session.duration}</span>
                  </div>
                  <Button className="w-full mt-4">
                    Join Session
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Explore;