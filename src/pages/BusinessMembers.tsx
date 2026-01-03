import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, FileText, BarChart3, Users, Eye, Crown, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PREMIUM_FEATURES_ENABLED } from '@/adapters/constants';
export default function BusinessMembers() {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const benefits = [{
    icon: FileText,
    title: 'White Papers & Publications',
    description: 'Publish comprehensive white papers with annotations, versioning, and professional formatting.',
    features: ['Version control', 'Reader annotations', 'Professional templates', 'SEO optimization']
  }, {
    icon: BarChart3,
    title: 'Business Reports Hub',
    description: 'Share investor reports, financial updates, and strategic insights with your audience.',
    features: ['Highlighted reports', 'Interactive dashboards', 'Engagement metrics', 'Investor access']
  }, {
    icon: Eye,
    title: 'Live Company Dashboard',
    description: 'Monitor your company\'s utility scores, content shares, and notification streams in real-time.',
    features: ['Utility tracking', 'Share analytics', 'Notification center', 'Performance insights']
  }, {
    icon: Users,
    title: 'Business Discovery',
    description: 'Appear in "Discover Business Members" and compete for "Most Influential" recognition.',
    features: ['Premium placement', 'Industry filtering', 'Influence ranking', 'Networking opportunities']
  }];
  const additionalFeatures = [
    'Ad-free environment - you control what\'s highlighted',
    ...(PREMIUM_FEATURES_ENABLED ? ['Commissionable premium report program'] : []),
    'AI-powered company voice alignment (optional add-on)',
    'Professional profile pages with team showcase',
    'Direct investor communication channels',
    'Industry-specific networking tools'
  ];
  const handleApplyClick = () => {
    if (user) {
      navigate('/join-now?type=business');
    } else {
      navigate('/auth?redirect=/join-now?type=business');
    }
  };
  return <div className="min-h-screen p-6 pb-32">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <header className="mb-16 text-center">
        <div className="glass-card rounded-3xl p-12 backdrop-blur-xl mb-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Crown className="w-10 h-10 text-primary" />
            <h1 className="text-5xl font-light text-foreground tracking-wide">
              Business Members
            </h1>
          </div>
          <p className="text-xl text-muted-foreground font-light max-w-3xl mx-auto mb-8">
            Publish your real expertise. Connect with decision-makers. Build influence through substance.
          </p>
          <Button onClick={handleApplyClick} size="lg" className="mx-auto">
            Apply as Business Member
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto space-y-16">
        {/* Benefits Grid */}
        <section>
          <h2 className="text-3xl font-semibold text-foreground mb-8 text-center">Why Business Members Choose Us</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {benefits.map((benefit, idx) => {
            const IconComponent = benefit.icon;
            return <Card key={idx} className="glass-card p-8 hover:bg-background/60 transition-all duration-300 opacity-100 rounded-lg shadow-2xl border-[#e6f0ff] bg-[#f7fafc]/5">
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
                    {benefit.features.map((feature, fIdx) => <div key={fIdx} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>)}
                  </div>
                </Card>;
          })}
          </div>
        </section>

        {/* Company Profile Preview */}
        <section>
          <h2 className="text-3xl font-semibold text-foreground mb-8 text-center">Your Company Profile</h2>
          <Card className="glass-card p-8 max-w-4xl mx-auto bg-[#f7fafc]/[0.04]">
            <div className="flex items-start space-x-6 mb-6">
              <div className="w-20 h-20 bg-primary/20 rounded-xl flex items-center justify-center">
                <Building2 className="w-10 h-10 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-2xl font-semibold text-foreground">Your Company Name</h3>
                  <Badge className="bg-primary/10 text-primary border-primary/20">Business Member</Badge>
                </div>
                <p className="text-muted-foreground mb-4">
                  Professional mission statement and company goals appear here, aligned with your industry focus and team expertise.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">87</div>
                    <div className="text-sm text-muted-foreground">Utility Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">1.2k</div>
                    <div className="text-sm text-muted-foreground">Report Shares</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">24</div>
                    <div className="text-sm text-muted-foreground">Publications</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">#3</div>
                    <div className="text-sm text-muted-foreground">Industry Rank</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-border pt-6">
              <h4 className="font-semibold text-foreground mb-3">Latest Publications</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <span className="text-sm text-foreground">Q4 2024 Market Analysis</span>
                  <Badge variant="outline">White Paper</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <span className="text-sm text-foreground">Sustainability Initiative Report</span>
                  <Badge variant="outline">Business Report</Badge>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Additional Features */}
        <section>
          <h2 className="text-3xl font-semibold text-foreground mb-8 text-center">Everything Included</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto border border-solid rounded-lg shadow-xl bg-[#cad4e0]/5">
            {additionalFeatures.map((feature, idx) => <div key={idx} className="space-x-3 p-4 glass-card rounded-lg items-center justify-center flex flex-row">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-muted-foreground text-justify">{feature}</span>
              </div>)}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="glass-card p-12 max-w-2xl mx-auto bg-[#f7fafc]/[0.04]">
            <h2 className="text-3xl font-semibold text-foreground mb-4">Ready to Elevate Your Business?</h2>
            <p className="text-muted-foreground mb-8">
              Join the platform where your expertise becomes influence and your insights drive industry conversations.
            </p>
            <Button onClick={handleApplyClick} size="lg">
              Apply as Business Member
            </Button>
          </Card>
        </section>
      </div>
    </div>;
}