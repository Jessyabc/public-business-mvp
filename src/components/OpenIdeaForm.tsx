import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/ui/components/GlassCard";
import { Lightbulb } from "lucide-react";

interface OpenIdeaFormProps {
  onSuccess?: (ideaId: string) => void;
}

export function OpenIdeaForm({ onSuccess }: OpenIdeaFormProps) {
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot field
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ideaUrl, setIdeaUrl] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check
    if (website) {
      toast({
        title: "Error",
        description: "Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Validation
    if (content.length < 10 || content.length > 280) {
      toast({
        title: "Invalid length",
        description: "Ideas must be between 10-280 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert open idea
      const { data: idea, error: ideaError } = await supabase
        .from("open_ideas")
        .insert({ 
          content, 
          email: email || null 
        })
        .select()
        .single();

      if (ideaError) throw ideaError;

      // Store email as lead if provided
      if (email) {
        await supabase
          .from("leads")
          .insert({ 
            email, 
            source: "open_idea" 
          });
      }

      const url = `${window.location.origin}/idea/${idea.id}`;
      setIdeaUrl(url);
      setSubmitted(true);
      
      toast({
        title: "Idea planted! 🌱",
        description: "Your idea is now live and ready for brainstorms.",
      });

      onSuccess?.(idea.id);
    } catch (error: unknown) {
      console.error('Failed to submit idea', error);
      let description = 'Failed to submit idea. Please try again.';
      if (error instanceof Error) {
        description = error.message;
      } else if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        description = (error as { message: string }).message;
      }
      toast({
        title: "Error",
        description,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <GlassCard className="glass-card rounded-3xl text-center" padding="lg">
        <div className="mb-4">
          <Lightbulb className="w-16 h-16 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Nice. We planted your idea.
          </h3>
          <p className="text-muted-foreground mb-6">
            Track it here: <a href={ideaUrl} className="text-primary underline">{ideaUrl}</a>
          </p>
        </div>
        <Button
          onClick={() => {
            setSubmitted(false);
            setContent("");
            setEmail("");
          }}
          variant="outline"
          className="glass-button bg-white/10 hover:bg-white/20 border border-white/30"
        >
          Share Another Idea
        </Button>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="glass-card rounded-3xl" padding="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Textarea
            placeholder="What's the question you can't stop thinking about?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] glass-input border-pb-blue/20 resize-none focus-glass"
            maxLength={280}
            required
          />
          <div className="flex justify-between text-sm text-pb-text2 mt-2">
            <span>{content.length < 10 ? `${10 - content.length} more needed` : "Perfect length"}</span>
            <span>{content.length}/280</span>
          </div>
        </div>

        <div>
          <Input
            type="email"
            placeholder="Email for updates (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="glass-input border-pb-blue/20 focus-glass"
          />
        </div>

        {/* Honeypot field - hidden */}
        <div style={{ display: "none" }}>
          <Input
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || content.length < 10 || content.length > 280}
          className="w-full glass-button bg-pb-blue/20 hover:bg-pb-blue/30 text-pb-blue border border-pb-blue/30 h-12 text-lg font-medium rounded-xl interactive-glass"
        >
          {isSubmitting ? "Planting..." : "Drop Your Idea"}
        </Button>
      </form>
    </GlassCard>
  );
}