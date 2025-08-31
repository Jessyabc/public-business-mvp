import { Lightbulb } from "lucide-react";
import { OpenIdeaForm } from "@/components/OpenIdeaForm";
import { IdeaCard } from "@/components/IdeaCard";
import { BrainstormCard } from "@/components/BrainstormCard";
import { useCuratedIdeas, useFreeBrainstorms } from "@/hooks/useOpenIdeas";
import { useNavigate } from "react-router-dom";

export function Landing() {
  const navigate = useNavigate();
  const { data: curatedIdeas = [] } = useCuratedIdeas();
  const { data: freeBrainstorms = [] } = useFreeBrainstorms();

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 pt-20">
          <h1 className="text-7xl font-bold text-foreground mb-6 leading-tight">
            Drop an idea.<br />
            Watch it grow.
          </h1>
        </div>

        {/* Open Idea Form */}
        <div className="max-w-2xl mx-auto mb-20">
          <OpenIdeaForm 
            onSuccess={(ideaId) => navigate(`/idea/${ideaId}`)}
          />
        </div>

        {/* Curated Ideas Feed */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Ideas Growing Right Now
          </h2>
          {curatedIdeas.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {curatedIdeas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  onClick={() => navigate(`/idea/${idea.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <Lightbulb className="w-16 h-16 mx-auto mb-4 text-primary/50" />
              <p>No curated ideas yet. Be the first to drop an idea!</p>
            </div>
          )}
        </div>

        {/* Free Brainstorms */}
        {freeBrainstorms.length > 0 && (
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Free Brainstorms
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {freeBrainstorms.map((brainstorm) => (
                <BrainstormCard
                  key={brainstorm.id}
                  brainstorm={brainstorm}
                  showFreeBadge={true}
                  onClick={() => navigate(`/brainstorm/${brainstorm.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}