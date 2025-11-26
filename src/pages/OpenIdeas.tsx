import { Link } from 'react-router-dom';
import { Plus, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOpenIdeas, type OpenIdea } from '@/hooks/useOpenIdeas';
import { useAuth } from '@/contexts/AuthContext';
import { PostCardModal } from '@/components/post/PostCardModal';
import { useState } from 'react';

// Environment variable for gating (could be set in production)
const REQUIRE_AUTH = true; // Set this based on your preference


export default function OpenIdeas() {
  const { user } = useAuth();
  const { ideas, loading, error } = useOpenIdeas();
  const [selectedIdea, setSelectedIdea] = useState<OpenIdea | null>(null);

  // If authentication is required and user is not logged in
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Open Ideas Bank</h1>
          <p className="text-muted-foreground">
            Curated ideas from the community, waiting for your creative spark
          </p>
        </div>
        <Link to="/open-ideas/new">
          <Button className="mt-4 md:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            Submit an Idea
          </Button>
        </Link>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading && (
          <div className="col-span-full text-sm text-muted-foreground">
            Loading open ideas…
          </div>
        )}
        {error && !loading && (
          <div className="col-span-full p-6 rounded-2xl bg-destructive/10 border border-destructive/20 space-y-2">
            <div className="font-semibold text-destructive">Error loading ideas:</div>
            <div className="text-destructive/80">{error}</div>
            <div className="text-xs text-muted-foreground mt-2">
              If you see a permission error, ensure the migration <code className="bg-muted px-1 rounded">20250106000000_add_open_ideas_select_policies.sql</code> has been applied.
            </div>
          </div>
        )}
        {!loading && !error && ideas.map((idea) => (
          <div
            key={idea.id}
            onClick={() => setSelectedIdea(idea)}
            className="rounded-2xl border border-border bg-card px-5 py-4 flex flex-col justify-between min-h-[160px] cursor-pointer hover:bg-accent transition-all duration-200 theme-business:rounded-xl theme-business:shadow-[var(--neuro-card-shadow-light),var(--neuro-card-shadow-dark)] theme-business:border-0 theme-business:hover:shadow-[var(--neuro-shadow-inset-light),var(--neuro-shadow-inset-dark)]"
          >
            <p className="text-sm text-foreground line-clamp-4 leading-relaxed">
              {idea.text}
            </p>
            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground theme-business:border-t-0">
              <span>{idea.source === 'user' ? 'From a member' : 'From the community'}</span>
              <span>
                {idea.created_at
                  ? new Date(idea.created_at).toLocaleDateString()
                  : ''}
              </span>
            </div>
          </div>
        ))}
      </div>

      <PostCardModal
        openIdea={selectedIdea}
        isOpen={!!selectedIdea}
        onClose={() => setSelectedIdea(null)}
      />
    </div>
  );
}