import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIdeaBrainstorm, useOpenIdea } from '@/hooks/useOpenIdeas';
import { BrainstormCard } from '@/components/BrainstormCard';
import { Skeleton } from '@/ui/feedback/Skeleton';
import { Page } from '@/ui/layouts/Page';
import { GlassCard } from '@/ui/components/GlassCard';

export function BrainstormDetail() {
  const { id } = useParams<{ id: string }>();
  
  const { data: brainstorm, isLoading: brainstormLoading } = useIdeaBrainstorm(id!);
  const { data: idea } = useOpenIdea(brainstorm?.idea_id!);

  if (brainstormLoading) {
    return (
      <Page>
        <div className="space-y-6 pt-8">
          <Skeleton lines={1} />
          <Skeleton lines={3} avatar />
          <Skeleton lines={2} />
        </div>
      </Page>
    );
  }

  if (!brainstorm) {
    return (
      <Page>
        <div className="pt-8">
          <GlassCard className="text-center">
            <p className="text-muted-foreground">Brainstorm not found</p>
            <Link to="/public/brainstorms">
              <Button variant="outline" className="mt-4">
                Back to Brainstorms
              </Button>
            </Link>
          </GlassCard>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="space-y-6 pt-8" role="main">
        {/* Back Button */}
        <Link to={idea ? `/idea/${idea.id}` : "/landing"}>
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>{idea ? "Back to Idea" : "Back to Home"}</span>
          </Button>
        </Link>

        {/* Reference Idea */}
        {idea && (
          <GlassCard className="border-primary/20">
            <div className="flex items-start gap-4">
              <MessageSquare className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Brainstorm on:</p>
                <p className="text-foreground leading-relaxed">{idea.content}</p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Main Brainstorm */}
        <div>
          <h1 className="sr-only">Brainstorm Detail</h1>
          <BrainstormCard brainstorm={brainstorm} />
        </div>

        {/* Actions */}
        {idea && (
          <div className="flex justify-center">
            <Link to={`/brainstorm/new?ideaId=${idea.id}`}>
              <Button className="px-8 py-3 text-lg font-medium">
                Add Your Own Brainstorm
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Page>
  );
}