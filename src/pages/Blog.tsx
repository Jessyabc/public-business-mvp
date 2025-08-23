import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Clock, BookOpen, ArrowRight, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Blog() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'updates', 'devlog', 'design-notes', 'investor-notes'];
  
  const posts = [
    {
      id: 1,
      title: 'Introducing Public Business: Where Curiosity Meets Execution',
      excerpt: 'We\'re building a platform that bridges the gap between individual curiosity and business expertise. Here\'s why the world needs this connection.',
      category: 'updates',
      author: 'Public Business Team',
      publishedAt: '2024-01-15',
      readTime: '5 min read',
      featured: true
    },
    {
      id: 2,
      title: 'The Design Philosophy Behind Our VisionOS Aesthetic',
      excerpt: 'How we crafted a glassmorphic interface that adapts to both public curiosity and business professionalism.',
      category: 'design-notes',
      author: 'Design Team',
      publishedAt: '2024-01-10',
      readTime: '8 min read',
      featured: false
    },
    {
      id: 3,
      title: 'Building with Supabase: Real-time Brainstorm Connections',
      excerpt: 'Technical deep-dive into how we handle real-time collaboration and idea branching at scale.',
      category: 'devlog',
      author: 'Engineering Team',
      publishedAt: '2024-01-05',
      readTime: '12 min read',
      featured: false
    },
    {
      id: 4,
      title: 'Q4 2023 Progress: From Concept to Community',
      excerpt: 'Our journey from initial concept to launch, key metrics, and what we\'ve learned from early users.',
      category: 'investor-notes',
      author: 'Founders',
      publishedAt: '2023-12-28',
      readTime: '6 min read',
      featured: false
    },
    {
      id: 5,
      title: 'The Psychology of T-Scores: Measuring Intellectual Impact',
      excerpt: 'Why traditional engagement metrics don\'t work for substantive discourse, and how we built a better system.',
      category: 'design-notes',
      author: 'Product Team',
      publishedAt: '2023-12-20',
      readTime: '10 min read',
      featured: false
    },
    {
      id: 6,
      title: 'Platform Security: Protecting Ideas and Intellectual Property',
      excerpt: 'Our approach to securing user-generated content while maintaining openness and collaboration.',
      category: 'devlog',
      author: 'Security Team',
      publishedAt: '2023-12-15',
      readTime: '7 min read',
      featured: false
    }
  ];

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement email subscription
    toast({
      title: "Subscribed!",
      description: "You'll receive updates about new posts and platform developments.",
    });
    setEmail('');
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'all': 'All Posts',
      'updates': 'Updates', 
      'devlog': 'Devlog',
      'design-notes': 'Design Notes',
      'investor-notes': 'Investor Notes'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'updates': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'devlog': 'bg-green-500/20 text-green-400 border-green-500/30',
      'design-notes': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'investor-notes': 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <div className="min-h-screen p-6 pb-32">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="mb-12 text-center">
        <div className="glass-card rounded-3xl p-8 backdrop-blur-xl mb-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-light text-foreground tracking-wide">
              Public Business Blog
            </h1>
          </div>
          <p className="text-muted-foreground mt-2 font-light max-w-2xl mx-auto">
            Updates, insights, and behind-the-scenes looks at building the future of professional networking.
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Subscribe Section */}
        <Card className="glass-card p-8 max-w-2xl mx-auto text-center">
          <Bell className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-4">Stay Updated</h2>
          <p className="text-muted-foreground mb-6">
            Get notified when we publish new posts about platform updates, design insights, and development progress.
          </p>
          
          <form onSubmit={handleSubscribe} className="flex space-x-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit">
              Subscribe
            </Button>
          </form>
        </Card>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              size="sm"
            >
              {getCategoryLabel(category)}
            </Button>
          ))}
        </div>

        {/* Featured Post */}
        {selectedCategory === 'all' && (
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Featured</h2>
            {posts.filter(post => post.featured).map((post) => (
              <Card key={post.id} className="glass-card p-8 hover:bg-background/60 transition-all duration-300 cursor-pointer">
                <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <Badge className={getCategoryColor(post.category)}>
                        {getCategoryLabel(post.category)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Featured</span>
                    </div>
                    
                    <h3 className="text-2xl font-semibold text-foreground mb-3 hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                  
                  <ArrowRight className="w-6 h-6 text-muted-foreground mt-4 lg:mt-0" />
                </div>
              </Card>
            ))}
          </section>
        )}

        {/* Blog Posts Grid */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            {selectedCategory === 'all' ? 'Latest Posts' : getCategoryLabel(selectedCategory)}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.filter(post => !post.featured || selectedCategory !== 'all').map((post) => (
              <Card key={post.id} className="glass-card p-6 hover:bg-background/60 transition-all duration-300 cursor-pointer flex flex-col">
                <div className="flex-1">
                  <Badge className={`${getCategoryColor(post.category)} mb-3`}>
                    {getCategoryLabel(post.category)}
                  </Badge>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-3 hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
                
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <Card className="glass-card p-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No posts found</h3>
              <p className="text-muted-foreground">
                No posts in this category yet. Check back soon for updates!
              </p>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}