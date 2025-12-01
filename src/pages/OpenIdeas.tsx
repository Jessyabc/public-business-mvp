import { Link } from 'react-router-dom';
import { Plus, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useComposerStore } from '@/hooks/useComposerStore';
import { ComposerModal } from '@/components/composer/ComposerModal';

const REQUIRE_AUTH = true;

export default function OpenIdeas() {
  const { user } = useAuth();
  const { posts, loading, fetchPosts } = usePosts();
  const { isOpen, openComposer, closeComposer } = useComposerStore();
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);

  // Filter for open ideas (public sparks/brainstorms)
  const openIdeas = posts.filter(p => p.kind === 'Spark' && p.mode === 'public');

  if (REQUIRE_AUTH && !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 max-w-2xl mx-auto">
          <Lightbulb className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h1 className="text-3xl font-bold mb-4">Open Ideas Bank</h1>
          <p className="text-muted-foreground mb-6">
            Access our curated collection of open ideas to spark your creativity. 
            Sign in to explore hundreds of community-submitted concepts waiting for your unique perspective.
          </p>
          <div className="space-y-4">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto">
                Sign In to Access Ideas
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              Don't have an account? <Link to="/auth" className="text-primary hover:underline">Create one</Link> - it's free!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Open Ideas Bank</h1>
            <p className="text-muted-foreground">
              Curated ideas from the community, waiting for your creative spark
            </p>
          </div>
          <Button onClick={() => openComposer()} className="mt-4 md:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            Submit an Idea
          </Button>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading && (
            <div className="col-span-full text-sm text-muted-foreground">
              Loading open ideas…
            </div>
          )}
          {!loading && openIdeas.map((idea) => (
            <div
              key={idea.id}
              onClick={() => {
                setSelectedIdeaId(idea.id);
                openComposer();
              }}
              className="rounded-2xl border border-border bg-card px-5 py-4 flex flex-col justify-between min-h-[160px] cursor-pointer hover:bg-accent transition-all"
            >
              <p className="text-sm text-foreground line-clamp-4 leading-relaxed">
                {idea.content}
              </p>
              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                <span>From the community</span>
                <span>{new Date(idea.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ComposerModal isOpen={isOpen} onClose={closeComposer} />
    </>
  );
}
