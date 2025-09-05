import { useState, useEffect } from "react";
import { TimelineSection } from "@/components/landing/TimelineSection";
import { ComposerSection } from "@/components/landing/ComposerSection";
import { BrainstormPreviewList } from "@/components/BrainstormPreviewList";
import { useAnalytics } from "@/hooks/useAnalytics";

export function NewLanding() {
  const [showComposer, setShowComposer] = useState(false);
  const analytics = useAnalytics();

  // Track hero view on mount
  useEffect(() => {
    analytics.trackLandingView();
  }, [analytics]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        {/* Logo */}
        <div className="mb-14 z-10">
          <img 
              src="/lovable-uploads/7b84831f-eb6d-4acd-bf51-5d3d7be705ba.png" 
              alt="Public Business" 
              className="h-52 sm:h-64 lg:h-80 xl:h-96 object-contain mx-auto"
            />
        </div>
        
        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-center max-w-4xl z-10">
          Your ideas deserve a stage.
        </h1>
        
        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-white/80 mb-12 text-center max-w-3xl leading-relaxed z-10">
          Share your thoughts. Watch them evolve through collaboration. 
          Build something meaningful together.
        </p>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/30 rounded-full mt-2"></div>
          </div>
        </div>

        {/* Background effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </section>

      {/* Timeline Section */}
      <TimelineSection onComplete={() => setShowComposer(true)} />

      {/* Composer Section */}
      <section className="bg-gradient-to-b from-slate-700 to-slate-600">
        <ComposerSection isVisible={showComposer} />
      </section>

      {/* Featured Brainstorms Teaser */}
      <section className="bg-slate-600 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Featured Branches
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              See how ideas are already blossoming into collaboration
            </p>
          </div>
          
          <BrainstormPreviewList />
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-b from-slate-600 to-slate-900 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Ready to Start Collaborating?
          </h2>
          <p className="text-xl text-white/80 mb-12">
            Join the community and turn your sparks into meaningful connections.
          </p>
        </div>
      </section>
    </div>
  );
}
