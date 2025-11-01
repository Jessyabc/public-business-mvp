import { useState, useEffect } from "react";
import { TimelineSection } from "@/components/landing/TimelineSection";
import { ComposerSection } from "@/components/landing/ComposerSection";
import { BrainstormPreviewList } from "@/components/BrainstormPreviewList";
import { useAnalytics } from "@/hooks/useAnalytics";
import pbLogoHero from "@/assets/pb-logo-hero.png";

export function NewLanding() {
  const [showComposer, setShowComposer] = useState(false);
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackLandingView();
  }, [analytics]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative flex flex-col items-center justify-center px-3 overflow-hidden"
        style={{ 
          height: '100vh',
          minHeight: '-webkit-fill-available'
        }}
      >

        {/* Logo */}
        <div className="mb-14 z-10">
          <img
            src={pbLogoHero}
            alt="Public Business"
            className="
              h-52 sm:h-64 lg:h-80 xl:h-96
              object-contain mx-auto
              drop-shadow-brand
            "
          />
        </div>

        {/* Main Headline */}
        <h1
          className="
            text-5xl md:text-7xl font-bold mb-6 text-center max-w-4xl z-10
            text-[var(--text-primary)]
            [text-shadow:0_0_12px_rgba(255,255,255,0.12)]
          "
        >
          Your ideas deserve a stage.
        </h1>

        {/* Subheadline */}
        <p
          className="
            text-xl md:text-2xl mb-12 text-center max-w-3xl leading-relaxed z-10
            text-[var(--text-secondary)]
            [text-shadow:0_0_10px_rgba(255,255,255,0.10)]
          "
        >
          Share your thoughts. Watch them evolve through collaboration. Build something meaningful together.
        </p>

        {/* Scroll indicator */}
        <a 
          href="#timeline" 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10 cursor-pointer hover:scale-110 transition-transform"
          aria-label="Scroll to timeline"
        >
          <div className="w-6 h-10 border-2 border-[var(--glass-border)] rounded-full flex justify-center">
            <div className="w-1 h-3 bg-[var(--glass-border)] rounded-full mt-2"></div>
          </div>
        </a>
      </section>

      {/* Timeline Section */}
      <TimelineSection onComplete={() => setShowComposer(true)} />

      {/* Composer Section */}
      <section className="bg-[var(--surface)]">
        <ComposerSection isVisible={showComposer} />
      </section>

      {/* Featured Brainstorms Teaser */}
      <section className="bg-gradient-to-b from-[var(--surface)] to-[var(--background)] py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-4">Featured Branches</h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
              See how ideas are already blossoming into collaboration
            </p>
          </div>

          <BrainstormPreviewList />
        </div>
      </section>
    </div>
  );
}
