// Update this page (the content is just a fallback if you fail to update the page)

import { useState } from "react";
import BrainstormCard from "@/components/BrainstormCard";
import ConnectionDialog from "@/components/ConnectionDialog";
import DynamicMenu from "@/components/DynamicMenu";
import { mockBrainstorms, getConnectedBrainstorms } from "@/data/brainstorms";
import { Brainstorm } from "@/types/brainstorm";

const Index = () => {
  const [selectedBrainstorm, setSelectedBrainstorm] = useState<Brainstorm | null>(null);
  const [connectedBrainstorms, setConnectedBrainstorms] = useState<Brainstorm[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleConnect = (brainstormId: string) => {
    const brainstorm = mockBrainstorms.find(b => b.id === brainstormId);
    if (brainstorm) {
      setSelectedBrainstorm(brainstorm);
      setConnectedBrainstorms(getConnectedBrainstorms(brainstormId));
      setIsDialogOpen(true);
    }
  };

  const sortedBrainstorms = [...mockBrainstorms].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <div className="min-h-screen pb-32 px-6">
      <div className="max-w-4xl mx-auto pt-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-light text-foreground/90 tracking-wide">
            Your Brainstorms
          </h1>
          <p className="text-foreground/60 mt-2 font-light">
            Floating ideas in digital space • Connected thoughts in chronological flow
          </p>
        </header>
        
        <div className="space-y-6">
          {sortedBrainstorms.map((brainstorm) => (
            <BrainstormCard
              key={brainstorm.id}
              brainstorm={brainstorm}
              onConnect={handleConnect}
            />
          ))}
        </div>
      </div>
      
      <DynamicMenu />
      
      <ConnectionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        sourceBrainstorm={selectedBrainstorm}
        connectedBrainstorms={connectedBrainstorms}
      />
    </div>
  );
};

export default Index;
