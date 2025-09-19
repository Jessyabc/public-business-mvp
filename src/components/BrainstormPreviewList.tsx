import { useState, useEffect } from "react";
import { BrainstormCard } from "@/components/BrainstormCard";
import { BrainstormModal } from "@/components/BrainstormModal";
import { useFreeBrainstorms, IdeaBrainstorm } from "@/hooks/useOpenIdeas";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Lightbulb } from "lucide-react";

export function BrainstormPreviewList() {
  const { data: freeBrainstorms = [] } = useFreeBrainstorms();
  const [selectedBrainstorm, setSelectedBrainstorm] = useState<IdeaBrainstorm | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const analytics = useAnalytics();

  const limitedBrainstorms = freeBrainstorms.slice(0, 3);

  const handleCardClick = (brainstorm: IdeaBrainstorm) => {
    analytics.trackTeaserClick(brainstorm.id);
    setSelectedBrainstorm(brainstorm);
    setIsModalOpen(true);
  };

  // Track teaser impressions
  useEffect(() => {
    limitedBrainstorms.forEach(brainstorm => {
      analytics.trackTeaserImpression(brainstorm.id);
    });
  }, [limitedBrainstorms, analytics]);

  if (limitedBrainstorms.length === 0) {
    return (
      <div className="text-center py-12">
        <Lightbulb className="w-16 h-16 mx-auto mb-4 text-primary/50" />
        <p className="text-muted-foreground">
          No brainstorms available yet. Start by sharing an idea!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {limitedBrainstorms.map((brainstorm) => (
          <BrainstormCard
            key={brainstorm.id}
            brainstorm={brainstorm}
            showFreeBadge={true}
            onClick={() => handleCardClick(brainstorm)}
          />
        ))}
      </div>
      
      <BrainstormModal
        brainstorm={selectedBrainstorm}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBrainstorm(null);
        }}
      />
    </>
  );
}