import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TimelineSection } from '@/components/landing/TimelineSection';
import { ComposerSection } from '@/components/landing/ComposerSection';
import { FeaturedBranches } from '@/components/landing/FeaturedBranches';

export function NewLanding() {
  const [showComposer, setShowComposer] = useState(false);
  const { user } = useAuth();

  // Analytics events
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'lp_view_hero', {
        event_category: 'landing',
      });
    }
  }, []);

  const handleTimelineComplete = () => {
    setShowComposer(true);
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'lp_reach_composer', {
        event_category: 'landing',
      });
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative">
        {/* Parallax logo */}
        <div className="mb-8 transform transition-transform duration-300 hover:scale-105 relative">
          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-2xl -m-4"></div>
          <img 
            src="/lovable-uploads/7b84831f-eb6d-4acd-bf51-5d3d7be705ba.png" 
            alt="Public Business - Creating Collaboration" 
            className="h-32 md:h-40 object-contain relative z-10"
          />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-ink-base mb-6 text-center leading-tight">
          Curiosity deserves a stage.
        </h1>
        
        <p className="text-xl md:text-2xl text-ink-base/70 mb-12 text-center max-w-3xl leading-relaxed">
          Share an idea. Watch it branch into something useful.
        </p>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-ink-base/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-ink-base/30 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <TimelineSection onComplete={handleTimelineComplete} />

      {/* Composer Section */}
      <ComposerSection isVisible={showComposer} />

      {/* Featured Branches */}
      <FeaturedBranches />

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pb-blue/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pb-blue/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
    </div>
  );
}