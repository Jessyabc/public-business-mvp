import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Brain, TrendingUp, FileText, Users, Crown, CheckCircle, Star, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PREMIUM_FEATURES_ENABLED } from '@/adapters/constants';

export default function PublicMembers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');

  const benefits = [
    {
      icon: Brain,
      title: 'Brainstorm Timelines',
      description: 'Create and extend idea branches with T-score tracking for meaningful intellectual engagement.',
      features: ['T-score progression', 'Idea branching', 'Timeline visualization', 'Impact tracking']
    },
    {
      icon: FileText,
      title: 'Premium Content Access',
      description: 'Follow company white papers, investor reports, and exclusive business insights.',
      features: ['White paper library', 'Investor reports', 'Business insights', 'Early access']
    },
    {
      icon: Crown,
      title: 'Most Influential Recognition',
      description: 'Compete for recognition on the Most Influential Public Members leaderboard.',
      features: ['Influence ranking', 'Community recognition', 'Profile highlights', 'Networking boost']
    },
    {
      icon: Users,
      title: 'Company Connections',
      description: 'Direct access to business leaders and decision-makers in your industries of interest.',
      features: ['Business networking', 'Industry insights', 'Mentorship opportunities', 'Career growth']
    }
  ];

  const pricingTiers = [
    {
      name: 'Free',
      price: 'Always Free',
      description: 'Essential features for curious minds',
      features: [
        'Unlimited brainstorms',
        'T-score tracking',
        'Basic white paper access',
        'Community participation',
        'Profile creation'
      ],
      highlighted: false
    },
    {
      name: 'Premium',
      price: 'Coming Soon',
      description: 'Enhanced access and exclusive content',
      features: [
        'Everything in Free',
        'Premium report bundles (10/month)',
        'Advanced T-score analytics',
        'Early access to publications',
        'Priority support',
        'Custom profile themes'
      ],
      highlighted: true,
      comingSoon: true
    },
    {
      name: 'Power User',
      price: 'Coming Soon', 
      description: 'Unlimited access for researchers',
      features: [
        'Everything in Premium',
        'Unlimited report access (250+)',
        'Direct business contact',
        'Exclusive webinars',
        'Advanced search filters',
        'Export capabilities'
      ],
      highlighted: false,
      comingSoon: true
    }
  ];

  const handleCreateProfile = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement email capture for premium features
    toast({
      title: "We'll keep you posted!",
      description: "You'll be first to know when premium features launch.",
    });
    setEmail('');
  };

  return (
    <div className="min-h-screen p-6 pb-32">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <header className="mb-16 text-center">
        <div className="glass-card rounded-3xl p-12 backdrop-blur-xl mb-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Brain className="w-10 h-10 text-primary" />
            <h1 className="text-5xl font-light text-foreground tracking-wide">
              Public Members
            </h1>
          </div>
          <p className="text-xl text-muted-foreground font-light max-w-3xl mx-auto mb-8">
            Turn curiosity into signal. Engage with ideas that matter and build your influence through meaningful contributions.
          </p>
          <Button onClick={handleCreateProfile} size="lg" className="mx-auto">
            {user ? 'Go to Profile' : 'Create Profile'}
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto space-y-16">
        {/* Benefits Grid */}
        <section>
          <h2 className="text-3xl font-semibold text-foreground mb-8 text-center">Why Public Members Love Us</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {benefits.map((benefit, idx) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={idx} className="glass-card p-8 hover:bg-background/60 transition-all duration-300">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {benefit.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Pricing Tiers */}
        {PREMIUM_FEATURES_ENABLED && (
        <section>
          <h2 className="text-3xl font-semibold text-foreground mb-8 text-center">Choose Your Experience</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map((tier, idx) => (
              <Card key={idx} className={`glass-card p-8 relative ${tier.highlighted ? 'ring-2 ring-primary/50' : ''}`}>
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{tier.name}</h3>
                  <div className="text-2xl font-bold text-primary mb-2">{tier.price}</div>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </div>
                
                <div className="space-y-3 mb-8">
                  {tier.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {tier.comingSoon ? (
                  <Button variant="outline" className="w-full" disabled>
                    Coming Soon
                  </Button>
                ) : (
                  <Button 
                    onClick={handleCreateProfile}
                    className={`w-full ${tier.highlighted ? '' : 'variant="outline"'}`}
                  >
                    Get Started
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </section>
        )}

        {/* Premium Notification */}
        {PREMIUM_FEATURES_ENABLED && (
        <section>
          <Card className="glass-card p-8 max-w-2xl mx-auto text-center">
            <Star className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">Be First to Access Premium</h2>
            <p className="text-muted-foreground mb-6">
              Get notified when premium features launch, including exclusive report bundles and advanced analytics.
            </p>
            
            <form onSubmit={handleNotifyMe} className="flex space-x-4 max-w-md mx-auto">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit">
                Notify Me
              </Button>
            </form>
          </Card>
        </section>
        )}

        {/* Feature Comparison */}
        {PREMIUM_FEATURES_ENABLED && (
        <section>
          <h2 className="text-3xl font-semibold text-foreground mb-8 text-center">Free vs Premium Features</h2>
          <Card className="glass-card p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-4">
              <div className="font-semibold text-foreground">Feature</div>
              <div className="text-center font-semibold text-foreground">Free</div>
              <div className="text-center font-semibold text-foreground">Premium</div>
              
              <div className="py-2 text-muted-foreground">Brainstorm Creation</div>
              <div className="text-center py-2"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></div>
              <div className="text-center py-2"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></div>
              
              <div className="py-2 text-muted-foreground">T-Score Tracking</div>
              <div className="text-center py-2"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></div>
              <div className="text-center py-2"><Zap className="w-5 h-5 text-primary mx-auto" /></div>
              
              <div className="py-2 text-muted-foreground">Report Access</div>
              <div className="text-center py-2 text-sm text-muted-foreground">Basic</div>
              <div className="text-center py-2 text-sm text-primary font-medium">10+ per month</div>
              
              <div className="py-2 text-muted-foreground">Business Networking</div>
              <div className="text-center py-2 text-sm text-muted-foreground">Limited</div>
              <div className="text-center py-2"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></div>
            </div>
          </Card>
        </section>
        )}

        {/* CTA Section */}
        <section className="text-center">
          <Card className="glass-card p-12 max-w-2xl mx-auto">
            <h2 className="text-3xl font-semibold text-foreground mb-4">Ready to Start Your Journey?</h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of curious minds turning ideas into influence on Public Business.
            </p>
            <Button onClick={handleCreateProfile} size="lg">
              {user ? 'Go to Profile' : 'Create Profile'}
            </Button>
          </Card>
        </section>
      </div>
    </div>
  );
}