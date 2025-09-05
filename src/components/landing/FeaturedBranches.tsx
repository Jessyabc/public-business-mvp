import { useState } from 'react';
import { useFreeBrainstorms } from '@/hooks/useOpenIdeas';
import { BrainstormCard } from '@/components/BrainstormCard';
import { BrainstormModal } from '@/components/BrainstormModal';
import { MessageSquare, TrendingUp, Lightbulb } from 'lucide-react';

export function FeaturedBranches() {
  const { data: freeBrainstorms = [], isLoading } = useFreeBrainstorms();
  const [selectedBrainstorm, setSelectedBrainstorm] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = (brainstorm: any) => {
    setSelectedBrainstorm(brainstorm);
    setIsModalOpen(true);

    // Analytics event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'teaser_click', {
        event_category: 'engagement',
        event_label: brainstorm.id,
      });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBrainstorm(null);
  };

  const displayBrainstorms = freeBrainstorms.slice(0, 3);

  if (isLoading) {
    return (
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-ink-base mb-8 text-center">
            Featured Branches
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-4 bg-ink-base/10 rounded mb-2"></div>
                <div className="h-4 bg-ink-base/10 rounded mb-4"></div>
                <div className="h-12 bg-ink-base/10 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (displayBrainstorms.length === 0) {
    return (
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-ink-base mb-8">
            Featured Branches
          </h3>
          <div className="glass-card p-12">
            <div className="scrim" />
            <div className="relative z-10">
              <Lightbulb className="w-16 h-16 mx-auto mb-4 text-pb-blue/50" />
              <p className="text-ink-base/70 text-lg">
                No branches available yet. Be the first to share an idea and watch it grow!
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-ink-base mb-4 text-center">
            Featured Branches
          </h3>
          <p className="text-ink-base/70 text-lg mb-12 text-center max-w-2xl mx-auto">
            See how ideas are already growing and branching into collaborative solutions
          </p>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayBrainstorms.map((brainstorm, index) => (
              <div
                key={brainstorm.id}
                className="glass-card p-6 cursor-pointer hover:shadow-pblg transition-all duration-200"
                onClick={() => handleCardClick(brainstorm)}
              >
                <div className="scrim" />
                <div className="relative z-10">
                  <h4 className="font-semibold text-ink-base mb-3 line-clamp-2">
                    {brainstorm.title}
                  </h4>
                  <p className="text-ink-base/70 text-sm mb-4 line-clamp-3">
                    {brainstorm.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-ink-base/60">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>Discussion</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>Growing</span>
                      </div>
                    </div>
                    <span className="bg-pb-blue/20 text-pb-blue px-2 py-1 rounded-full text-xs">
                      Preview
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BrainstormModal
        brainstorm={selectedBrainstorm}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}