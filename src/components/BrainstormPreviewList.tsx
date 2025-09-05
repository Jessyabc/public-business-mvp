import { useState } from "react";
import { BrainstormCard } from "@/components/BrainstormCard";
import { BrainstormModal } from "@/components/BrainstormModal";
import { useFreeBrainstorms } from "@/hooks/useOpenIdeas";
import { Lightbulb } from "lucide-react";

export function BrainstormPreviewList() {
  const { data: freeBrainstorms = [] } = useFreeBrainstorms();
  const [selectedBrainstorm, setSelectedBrainstorm] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = (brainstorm: any) => {
    setSelectedBrainstorm(brainstorm);
    setIsModalOpen(true);
  };

  const limitedBrainstorms = freeBrainstorms.slice(0, 3);

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