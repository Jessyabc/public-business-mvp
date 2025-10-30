import { useState } from "react";
import { GlassSurface } from "@/components/ui/GlassSurface";
import { GlassInput } from "@/components/ui/GlassInput";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
      // Call the edge function to submit the idea
      const { data, error: functionError } = await supabase.functions.invoke('submit-open-idea', {
        body: { 
          content, 
          email: email || null,
          notify_on_interaction: false,
          subscribe_newsletter: !!email
        }
      });

      if (functionError) throw functionError;
      
      if (!data?.success || !data?.id) {
        throw new Error('Failed to submit idea');
      }

      const url = `${window.location.origin}/idea/${data.id}`;
      setIdeaUrl(url);
      setSubmitted(true);
      
      toast({
        title: "Idea planted! 🌱",
        description: "Your idea is now live and ready for brainstorms.",
      });

      onSuccess?.(data.id);
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
      <GlassSurface className="rounded-3xl text-center p-8">
        <div className="mb-4">
          <Lightbulb className="w-16 h-16 text-[var(--accent)] mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Nice. We planted your idea.
          </h3>
          <p className="text-[var(--text-secondary)] mb-6">
            Track it here: <a href={ideaUrl} className="text-[var(--accent)] underline">{ideaUrl}</a>
          </p>
        </div>
        <button
          onClick={() => {
            setSubmitted(false);
            setContent("");
            setEmail("");
          }}
          className="glassButton glassButton--muted"
        >
          Share Another Idea
        </button>
      </GlassSurface>
    );
  }

  return (
    <GlassSurface className="rounded-3xl p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <GlassInput
            as="textarea"
            placeholder="What's the question you can't stop thinking about?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            maxLength={280}
            required
          />
          <div className="flex justify-between text-sm text-[var(--text-secondary)] mt-2">
            <span>{content.length < 10 ? `${10 - content.length} more needed` : "Perfect length"}</span>
            <span>{content.length}/280</span>
          </div>
        </div>

        <div>
          <GlassInput
            type="email"
            placeholder="Email for updates (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Honeypot field - hidden */}
        <div style={{ display: "none" }}>
          <GlassInput
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || content.length < 10 || content.length > 280}
          className="w-full glassButton glassButton--accent h-12 text-lg font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Planting..." : "Drop Your Idea"}
        </button>
      </form>
    </GlassSurface>
  );
}