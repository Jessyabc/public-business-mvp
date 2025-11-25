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
          <h1 className="text-3xl font-bold mb-2">Open Ideas Bank</h1>
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

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {loading && (
          <div className="col-span-3 text-sm text-white/60">
            Loading open ideas…
          </div>
        )}
        {error && !loading && (
          <div className="col-span-3 text-sm text-red-400 space-y-2">
            <div className="font-semibold">Error loading ideas:</div>
            <div>{error}</div>
            <div className="text-xs text-red-300/70 mt-2">
              If you see a permission error, ensure the migration <code className="bg-red-900/30 px-1 rounded">20250106000000_add_open_ideas_select_policies.sql</code> has been applied.
            </div>
          </div>
        )}
        {!loading && !error && ideas.map((idea) => (
          <div
            key={idea.id}
            onClick={() => setSelectedIdea(idea)}
            className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-3 flex flex-col justify-between min-h-[140px] cursor-pointer hover:bg-white/10 transition-colors"
          >
            <p className="text-sm text-white/90 line-clamp-4">
              {idea.text}
            </p>
            <div className="mt-3 flex items-center justify-between text-[11px] text-white/55">
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