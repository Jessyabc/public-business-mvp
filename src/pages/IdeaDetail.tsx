import { useParams, useNavigate } from "react-router-dom";
import { useOpenIdea, useIdeaBrainstorms } from "@/hooks/useOpenIdeas";
import { BrainstormCard } from "@/components/BrainstormCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Plus, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function IdeaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: idea, isLoading: ideaLoading } = useOpenIdea(id!);
  const { data: brainstorms = [], isLoading: brainstormsLoading } = useIdeaBrainstorms(id!);

  if (ideaLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Lightbulb className="w-16 h-16 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading idea...</p>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Idea not found</h1>
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
        {/* Idea Card */}
        <Card className="glass-business-card border-primary/20 mb-8">
          <CardContent className="p-8">
            <div className="flex items-start gap-4 mb-6">
              <Lightbulb className="w-12 h-12 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-xl text-foreground leading-relaxed mb-4">
                  {idea.content}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{idea.linked_brainstorms_count} brainstorms</span>
                  </div>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(idea.created_at))} ago</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={() => navigate(`/brainstorm/new?ideaId=${idea.id}`)}
                className="glass-business-card bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 px-8 py-3 text-lg font-medium rounded-xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Start a Brainstorm
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Brainstorms Section */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            {brainstorms.length > 0 ? "Brainstorms" : "No brainstorms yet"}
          </h2>

          {brainstormsLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading brainstorms...</p>
            </div>
          ) : brainstorms.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {brainstorms.map((brainstorm) => (
                <BrainstormCard
                  key={brainstorm.id}
                  brainstorm={brainstorm}
                  onClick={() => navigate(`/brainstorm/${brainstorm.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-primary/50" />
              <p className="text-muted-foreground mb-6">Be the first to brainstorm on this idea!</p>
              <Button
                onClick={() => navigate(`/brainstorm/new?ideaId=${idea.id}`)}
                variant="outline"
                className="glass-business-card"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start Brainstorming
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}