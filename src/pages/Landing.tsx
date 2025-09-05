import { Lightbulb } from "lucide-react";
import { OpenIdeaForm } from "@/components/OpenIdeaForm";
import { IdeaCard } from "@/components/IdeaCard";
import { Timeline } from "@/components/Timeline";
import { BrainstormPreviewList } from "@/components/BrainstormPreviewList";
import { useCuratedIdeas } from "@/hooks/useOpenIdeas";
import { useNavigate } from "react-router-dom";

export function Landing() {
  const navigate = useNavigate();
  const { data: curatedIdeas = [] } = useCuratedIdeas();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* VisionOS-inspired Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-blue-100/10 to-transparent rounded-full blur-2xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center py-20 mb-12">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            Curiosity with consequences.
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Share an idea. Watch it branch into something useful.
          </p>
          
          {/* Open Idea Form */}
          <div className="max-w-2xl mx-auto">
            <OpenIdeaForm 
              onSuccess={(ideaId) => navigate(`/idea/${ideaId}`)}
            />
          </div>
        </div>

        {/* Timeline Section */}
        <Timeline />

        {/* Curated Ideas Feed */}
        <div className="py-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
            Ideas Growing Right Now
          </h2>
          <p className="text-lg text-gray-600 mb-12 text-center max-w-2xl mx-auto">
            Watch how curiosity transforms into collaborative solutions
          </p>
          
          {curatedIdeas.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {curatedIdeas.slice(0, 6).map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  onClick={() => navigate(`/idea/${idea.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <Lightbulb className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <p>No curated ideas yet. Be the first to drop an idea!</p>
            </div>
          )}
        </div>

        {/* Free Brainstorm Previews */}
        <div className="py-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
            Free Brainstorm Previews
          </h2>
          <p className="text-lg text-gray-600 mb-12 text-center max-w-2xl mx-auto">
            Get a taste of the conversations happening around ideas
          </p>
          
          <BrainstormPreviewList />
        </div>

        {/* Footer CTA */}
        <div className="text-center py-20">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Ready to turn curiosity into connection?
          </h3>
          <p className="text-gray-600 mb-8">
            Join the community where ideas become reality
          </p>
        </div>
      </div>
    </div>
  );
}