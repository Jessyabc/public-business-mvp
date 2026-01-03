import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MessageCircle, 
  Shield,
  CheckCircle,
  Lightbulb,
  GitBranch,
  Link2,
  Eye,
  ArrowRight,
  BookOpen,
  Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GlassSurface } from '@/components/ui/GlassSurface';

export function Community() {
  // Get real member count
  const { data: memberCount } = useQuery({
    queryKey: ['community-member-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const guidelines = [
    {
      icon: MessageCircle,
      title: 'Respectful Debate',
      description: 'Engage in constructive discussions with diverse perspectives. Attack ideas, not people.',
      examples: ['Use evidence to support arguments', 'Acknowledge valid counterpoints', 'Maintain professional tone']
    },
    {
      icon: CheckCircle,
      title: 'Evidence-Based Content',
      description: 'Share credible sources and factual information. Quality over quantity.',
      examples: ['Link to reputable sources', 'Cite data and research', 'Fact-check before posting']
    },
    {
      icon: Shield,
      title: 'No Spam or Self-Promotion',
      description: 'Focus on value-added contributions rather than promotional content.',
      examples: ['Share insights, not ads', 'Contribute to discussions meaningfully', 'Follow 90/10 rule for self-promotion']
    },
    {
      icon: Users,
      title: 'Professional Standards',
      description: 'Maintain the platform\'s professional environment and intellectual rigor.',
      examples: ['Use appropriate language', 'Stay on topic', 'Respect intellectual property']
    }
  ];

  const howToParticipate = [
    {
      icon: Lightbulb,
      title: 'Share Your Spark',
      description: 'Post a brainstorm or business insight. Your idea enters the platform as a living entity that others can build upon.',
      action: 'Create your first post'
    },
    {
      icon: GitBranch,
      title: 'Continue Ideas',
      description: 'When you see an idea you want to build on, create a continuation. This creates a lineage chain showing how thoughts evolve.',
      action: 'Explore the feed'
    },
    {
      icon: Link2,
      title: 'Cross-Reference',
      description: 'Link related ideas across different threads using soft links. Help others discover connections between ideas.',
      action: 'Learn about linking'
    },
    {
      icon: Eye,
      title: 'Engage Thoughtfully',
      description: 'Read, react, and respond. Your engagement helps surface the most valuable insights to the community.',
      action: 'Start engaging'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-muted/20" />
        <div className="relative px-6 py-16 text-center">
          <div className="glass-card w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6 border border-accent/30">
            <Users className="w-10 h-10 text-[hsl(var(--accent))]" />
          </div>
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
            Community Guidelines
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            Join a community where curiosity meets collaboration. Learn how to participate and contribute meaningfully.
          </p>
          {memberCount !== undefined && (
            <p className="text-sm text-[var(--text-muted)] mt-4">
              {memberCount.toLocaleString()} members and growing
            </p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        {/* Community Guidelines */}
        <section>
          <h2 className="text-3xl font-semibold text-[var(--text-primary)] mb-8 text-center">Our Community Standards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guidelines.map((guideline, idx) => {
              const IconComponent = guideline.icon;
              return (
                <GlassSurface key={idx} className="p-6 hover:scale-[1.02] transition-transform duration-300">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="p-3 rounded-xl bg-[hsl(var(--accent))]/10">
                      <IconComponent className="w-6 h-6 text-[hsl(var(--accent))]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">{guideline.title}</h3>
                      <p className="text-[var(--text-secondary)] mb-4">{guideline.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-[var(--text-primary)] text-sm mb-2">Examples:</h4>
                    {guideline.examples.map((example, eIdx) => (
                      <div key={eIdx} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-[var(--text-secondary)]">{example}</span>
                      </div>
                    ))}
                  </div>
                </GlassSurface>
              );
            })}
          </div>
        </section>

        {/* How to Participate */}
        <section>
          <h2 className="text-3xl font-semibold text-[var(--text-primary)] mb-8 text-center">How to Participate</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {howToParticipate.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <GlassSurface key={idx} className="p-6 hover:scale-[1.02] transition-transform duration-300">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="p-3 rounded-xl bg-[hsl(var(--accent))]/10">
                      <IconComponent className="w-6 h-6 text-[hsl(var(--accent))]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">{item.title}</h3>
                      <p className="text-[var(--text-secondary)] mb-4">{item.description}</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        asChild
                        className="mt-2"
                      >
                        <Link to="/discuss">
                          {item.action}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </GlassSurface>
              );
            })}
          </div>
        </section>

        {/* Resources */}
        <section>
          <GlassSurface className="p-8">
            <div className="text-center mb-6">
              <BookOpen className="w-12 h-12 text-[hsl(var(--accent))] mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">Need Help?</h2>
              <p className="text-[var(--text-secondary)]">
                Find answers, report issues, or learn more about the platform
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" asChild>
                <Link to="/support-community">
                  <Shield className="mr-2 h-4 w-4" />
                  Community Support
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/how-it-works">
                  <BookOpen className="mr-2 h-4 w-4" />
                  How It Works
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/about">
                  <Users className="mr-2 h-4 w-4" />
                  About Us
                </Link>
              </Button>
            </div>
          </GlassSurface>
        </section>
      </div>
    </div>
  );
}

export default Community;