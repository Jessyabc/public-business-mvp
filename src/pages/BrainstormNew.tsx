import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useOpenIdea } from "@/hooks/useOpenIdeas";
import { useAuth } from "@/contexts/AuthContext";
import { Lightbulb, ArrowLeft } from "lucide-react";

export function BrainstormNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ideaId = searchParams.get("ideaId");
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authorDisplayName, setAuthorDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: idea } = useOpenIdea(ideaId!);

  useEffect(() => {
    if (!user) {
      setAuthorDisplayName("Guest");
    } else {
      // You can set user's display name here if available
      setAuthorDisplayName(user.email?.split("@")[0] || "User");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ideaId) {
      toast({
        title: "Error",
        description: "No idea ID provided",
        variant: "destructive",
      });
      return;
    }

    if (title.length < 3 || title.length > 80) {
      toast({
        title: "Invalid title",
        description: "Title must be between 3-80 characters.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please provide brainstorm content.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert brainstorm
      const { data: brainstorm, error: brainstormError } = await supabase
        .from("idea_brainstorms")
        .insert({
          idea_id: ideaId,
          title: title.trim(),
          content: content.trim(),
          author_user_id: user?.id || null,
          author_display_name: authorDisplayName.trim(),
        })
        .select()
        .single();

      if (brainstormError) throw brainstormError;

      // Update brainstorms count
      const { error: updateError } = await supabase
        .from("open_ideas")
        .update({ 
          linked_brainstorms_count: (idea?.linked_brainstorms_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq("id", ideaId);

      if (updateError) throw updateError;

      toast({
        title: "Brainstorm created! 🧠",
        description: "Your brainstorm has been added to the idea.",
      });

      navigate(`/idea/${ideaId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create brainstorm. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-2xl mx-auto pt-20">
        <Button
          onClick={() => navigate(`/idea/${ideaId}`)}
          variant="outline"
          className="glass-business-card mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Idea
        </Button>

        {/* Reference Idea */}
        {idea && (
          <Card className="glass-business-card border-primary/20 mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Lightbulb className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Brainstorming on:</p>
                  <p className="text-foreground leading-relaxed">{idea.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Brainstorm Form */}
        <Card className="glass-business-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Start Your Brainstorm</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Title
                </label>
                <Input
                  placeholder="Give your brainstorm a catchy title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="glass-business-card border-primary/20"
                  maxLength={80}
                  required
                />
                <div className="text-sm text-muted-foreground mt-1">
                  {title.length}/80 characters
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Your Brainstorm
                </label>
                <Textarea
                  placeholder="Share your thoughts, ideas, solutions, or questions about this idea..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] glass-business-card border-primary/20 resize-none"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Display Name
                </label>
                <Input
                  placeholder="How should we credit you?"
                  value={authorDisplayName}
                  onChange={(e) => setAuthorDisplayName(e.target.value)}
                  className="glass-business-card border-primary/20"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || title.length < 3 || title.length > 80 || !content.trim()}
                className="w-full glass-business-card bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 h-12 text-lg font-medium rounded-xl transition-all duration-300 hover:scale-105"
              >
                {isSubmitting ? "Creating..." : "Share Your Brainstorm"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}