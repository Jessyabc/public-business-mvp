import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Flag, MessageCircle, TrendingUp, Crown, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SupportCommunity() {
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

  const reportingSteps = [
    {
      step: 1,
      title: 'Identify the Issue',
      description: 'Determine if content violates community guidelines (harassment, spam, inappropriate content, etc.)'
    },
    {
      step: 2,
      title: 'Use Report Function',
      description: 'Click the report button on any post, comment, or user profile to flag content for review'
    },
    {
      step: 3,
      title: 'Provide Context',
      description: 'Include specific details about the violation to help our moderation team understand the issue'
    },
    {
      step: 4,
      title: 'Follow Up if Needed',
      description: 'For serious violations or urgent safety concerns, contact our team directly at contact@publicbusiness.com'
    }
  ];

  const safetyFeatures = [
    'Content moderation by experienced team',
    'AI-powered spam detection',
    'User reporting and blocking tools',
    'Professional verification for Business Members',
    'Transparent moderation decisions',
    'Appeal process for disputed actions'
  ];

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
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-light text-foreground tracking-wide">
              Community Guidelines
            </h1>
          </div>
          <p className="text-muted-foreground mt-2 font-light max-w-2xl mx-auto">
            Building a respectful, professional community where meaningful discussions thrive.
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto space-y-16">
        {/* Community Guidelines */}
        <section>
          <h2 className="text-3xl font-semibold text-foreground mb-8 text-center">Our Community Standards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {guidelines.map((guideline, idx) => {
              const IconComponent = guideline.icon;
              return (
                <Card key={idx} className="glass-card p-8 hover:bg-background/60 transition-all duration-300">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{guideline.title}</h3>
                      <p className="text-muted-foreground">{guideline.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground text-sm">Examples:</h4>
                    {guideline.examples.map((example, eIdx) => (
                      <div key={eIdx} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{example}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Safety & Reporting */}
        <section>
          <h2 className="text-3xl font-semibold text-foreground mb-8 text-center">Safety & Reporting</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Reporting Process */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-6">How to Report Content</h3>
              <div className="space-y-6">
                {reportingSteps.map((step, idx) => (
                  <div key={idx} className="flex space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">{step.step}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Features */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-6">Safety Features</h3>
              <Card className="glass-card p-6">
                <div className="space-y-3">
                  {safetyFeatures.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Emergency Contact</h4>
                    <p className="text-sm text-muted-foreground">
                      For urgent safety concerns or threats, contact us immediately at{' '}
                      <a href="mailto:contact@publicbusiness.com" className="text-primary hover:underline">
                        contact@publicbusiness.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Community Recognition */}
        <section>
          <h2 className="text-3xl font-semibold text-foreground mb-8 text-center">Recognition & Influence</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass-card p-8 text-center">
              <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-4">Most Influential</h3>
              <p className="text-muted-foreground mb-6">
                Recognition for Public Members who consistently contribute valuable insights and drive meaningful discussions.
              </p>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                Based on T-Score & Community Impact
              </Badge>
            </Card>

            <Card className="glass-card p-8 text-center">
              <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-4">Discover Business Members</h3>
              <p className="text-muted-foreground mb-6">
                Showcase of companies and organizations making significant contributions to industry knowledge.
              </p>
              <Link to="/members/business-members">
                <Button variant="outline" size="sm">
                  Explore Business Members
                </Button>
              </Link>
            </Card>
          </div>
        </section>

        {/* Contact & Support */}
        <section>
          <Card className="glass-card p-8 max-w-2xl mx-auto text-center">
            <Flag className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">Questions About Guidelines?</h2>
            <p className="text-muted-foreground mb-6">
              Our community team is here to help clarify guidelines, address concerns, and ensure Public Business remains a valuable space for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/support/faq">
                <Button variant="outline">
                  Check FAQ
                </Button>
              </Link>
              <Link to="/contact">
                <Button>
                  Contact Us
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}