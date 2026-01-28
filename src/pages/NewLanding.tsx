import { useState, useEffect } from "react";
import { TimelineSection } from "@/components/landing/TimelineSection";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import pbLogoHero from "@/assets/pb-logo-hero.png";

export function NewLanding() {
  const analytics = useAnalytics();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  useEffect(() => {
    analytics.trackLandingView();
  }, [analytics]);

  const handleGetStarted = () => {
    if (user) {
      navigate('/');
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative flex flex-col items-center justify-center min-h-screen px-6 py-20"
        style={{
          minHeight: "100vh",
          position: "relative",
          zIndex: 1
        }}
      >
        <div className="max-w-5xl mx-auto text-center space-y-8 z-10">
          {/* Logo - Big and wow - LCP element with high priority loading */}
          <div className="mb-12 z-10">
            <img 
              src={pbLogoHero} 
              alt="Public Business" 
              className="h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[28rem] 2xl:h-[32rem] mx-auto drop-shadow-brand object-contain transition-all duration-500 hover:scale-105"
              fetchPriority="high"
              decoding="async"
              width="512"
              height="512"
            />
          </div>

          {/* Main Headline - Better hierarchy */}
          <div className="space-y-6">
            <h1 className="
              text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold 
              text-[var(--text-primary)]
              leading-tight
              [text-shadow:0_0_20px_rgba(255,255,255,0.15)]
              tracking-tight
            ">
              Your ideas deserve a stage.
            </h1>

            {/* Subheadline - More refined */}
            <p className="
              text-lg sm:text-xl md:text-2xl 
              text-[var(--text-secondary)]
              leading-relaxed
              max-w-3xl mx-auto
              [text-shadow:0_0_12px_rgba(255,255,255,0.10)]
              font-light
              mt-6
            ">
              A living map of ideas where curiosity meets collaboration. 
              <br className="hidden sm:block" />
              <span className="text-[var(--text-primary)] font-normal">Watch thoughts evolve and connect in real time.</span>
            </p>
          </div>

          {/* CTA Button - Better positioned */}
          <div className="pt-4 z-10">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="
                h-12 px-10 
                text-base font-semibold 
                bg-[hsl(var(--accent))] 
                hover:bg-[hsl(var(--accent))]/90 
                text-white 
                shadow-xl 
                hover:shadow-2xl 
                transition-all 
                duration-300
                hover:scale-105
                rounded-full
              "
            >
              {user ? 'Go to Workspace' : 'Get Started Free'}
            </Button>
            {!user && (
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-5 text-center font-light">
                No credit card required • Free forever
              </p>
            )}
          </div>

          {/* Value proposition - Subtle addition */}
          <div className="pt-8 flex flex-wrap justify-center gap-6 text-sm text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent))]"></span>
              <span>Transparency</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent))]"></span>
              <span>Collaboration</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent))]"></span>
              <span>Innovation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <TimelineSection />

      <AuthModal 
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
      />
    </div>
  );
}