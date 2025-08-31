import { useParams, useNavigate } from "react-router-dom";
import { useIdeaBrainstorm, useOpenIdea } from "@/hooks/useOpenIdeas";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/ui/components/GlassCard";
import { Lightbulb, User, Clock, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function BrainstormDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: brainstorm, isLoading: brainstormLoading } = useIdeaBrainstorm(id!);
  const { data: idea } = useOpenIdea(brainstorm?.idea_id!);

  if (brainstormLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Lightbulb className="w-16 h-16 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading brainstorm...</p>
        </div>
      </div>
    );
  }

  if (!brainstorm) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Brainstorm not found</h1>
          <Button onClick={() => navigate("/")} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-4xl mx-auto pt-20">
        <Button
          onClick={() => navigate(idea ? `/idea/${idea.id}` : "/")}
          variant="outline"
          className="glass-ios-triple mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {idea ? "Back to Idea" : "Back to Home"}
        </Button>

        {/* Reference Idea */}
        {idea && (
          <GlassCard className="border-primary/20 mb-8 glass-ios-triple glass-corner-distort">
            <div className="flex items-start gap-4">
              <Lightbulb className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Brainstorm on:</p>
                <p className="text-foreground leading-relaxed">{idea.content}</p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Brainstorm Content */}
        <GlassCard className="border-primary/20 glass-ios-triple glass-corner-distort" padding="lg">
          <div className="mb-6">
            <h1 className="text-2xl text-foreground leading-tight font-semibold mb-4">
              {brainstorm.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{brainstorm.author_display_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDistanceToNow(new Date(brainstorm.created_at))} ago</span>
              </div>
            </div>
          </div>
          
          <div className="prose prose-lg max-w-none text-foreground">
            <div className="whitespace-pre-wrap leading-relaxed">
              {brainstorm.content}
            </div>
          </div>
        </GlassCard>

        {/* Actions */}
        <div className="flex justify-center mt-8">
          <Button
            onClick={() => navigate(idea ? `/brainstorm/new?ideaId=${idea.id}` : "/brainstorm/new")}
            className="glass-ios-triple bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 px-8 py-3 text-lg font-medium rounded-xl transition-all duration-300 hover:scale-105"
          >
            Add Your Own Brainstorm
          </Button>
        </div>
      </div>
    </div>
  );
}