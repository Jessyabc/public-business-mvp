import { Button } from '@/components/ui/button';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Sparkles, Building2, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AuthModal } from '@/components/auth/AuthModal';
import { useState } from 'react';

interface CTASectionProps {
  isVisible: boolean;
}

export function CTASection({ isVisible }: CTASectionProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleGetStarted = () => {
    if (user) {
      navigate('/');
    } else {
      setShowAuthModal(true);
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: 'Share Sparks',
      description: 'Post your ideas and watch them evolve through community collaboration',
      action: 'Start Creating',
      color: 'text-blue-400'
    },
    {
      icon: Building2,
      title: 'Business Insights',
      description: 'Organizations share learnings, experiments, and strategic insights',
      action: 'Explore Insights',
      color: 'text-purple-400'
    },
    {
      icon: Users,
      title: 'Connect & Collaborate',
      description: 'Build on others\' ideas, create continuations, and cross-link thoughts',
      action: 'Join Discussion',
      color: 'text-green-400'
    }
  ];

  return (
    <>
      <section 
        id="cta-section"
        className={`py-20 px-6 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'
        }`} 
        style={{ 
          position: 'relative', 
          zIndex: 100,
          isolation: 'isolate',
          pointerEvents: 'auto'
        }}
      >
        <div className="max-w-6xl mx-auto relative" style={{ zIndex: 100, position: 'relative', pointerEvents: 'auto' }}>
          {/* Main CTA */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
              Ready to share your ideas?
            </h2>
            <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
              Join a community where curiosity meets collaboration. Share sparks, build on insights, and watch ideas evolve.
            </p>
            <div style={{ position: 'relative', zIndex: 200, pointerEvents: 'auto' }}>
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="relative h-14 px-8 text-lg font-semibold bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/90 text-white shadow-lg hover:shadow-xl transition-all"
                style={{ 
                  position: 'relative',
                  pointerEvents: 'auto',
                  cursor: 'pointer'
                }}
              >
                {user ? 'Go to Workspace' : 'Get Started Free'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            {!user && (
              <p className="text-sm text-[var(--text-muted)] mt-4">
                No credit card required • Free forever
              </p>
            )}
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12" style={{ position: 'relative', zIndex: 100 }}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <GlassSurface
                  key={index}
                  className="relative p-6 hover:scale-105 transition-transform duration-300 cursor-pointer group"
                  onClick={handleGetStarted}
                  style={{ 
                    zIndex: 100, 
                    position: 'relative',
                    pointerEvents: 'auto',
                    cursor: 'pointer'
                  }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--text-secondary)] mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-sm font-medium text-[hsl(var(--accent))] group-hover:translate-x-1 transition-transform">
                    {feature.action}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </GlassSurface>
              );
            })}
          </div>

          {/* Additional Info */}
          <div className="text-center relative" style={{ zIndex: 50, position: 'relative' }}>
            <GlassSurface 
              className="relative p-8 max-w-2xl mx-auto" 
              style={{ 
                zIndex: 50, 
                position: 'relative',
                pointerEvents: 'auto'
              }}
            >
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                How it works
              </h3>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div>
                  <div className="w-8 h-8 rounded-full bg-[hsl(var(--accent))]/20 border border-[hsl(var(--accent))]/30 flex items-center justify-center mb-3">
                    <span className="text-[hsl(var(--accent))] font-bold">1</span>
                  </div>
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">Create</h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Share your spark or business insight
                  </p>
                </div>
                <div>
                  <div className="w-8 h-8 rounded-full bg-[hsl(var(--accent))]/20 border border-[hsl(var(--accent))]/30 flex items-center justify-center mb-3">
                    <span className="text-[hsl(var(--accent))] font-bold">2</span>
                  </div>
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">Connect</h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Link ideas, continue threads, build on insights
                  </p>
                </div>
                <div>
                  <div className="w-8 h-8 rounded-full bg-[hsl(var(--accent))]/20 border border-[hsl(var(--accent))]/30 flex items-center justify-center mb-3">
                    <span className="text-[hsl(var(--accent))] font-bold">3</span>
                  </div>
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">Evolve</h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Watch your ideas grow through collaboration
                  </p>
                </div>
              </div>
            </GlassSurface>
          </div>
        </div>
      </section>

      <AuthModal 
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
      />
    </>
  );
}

