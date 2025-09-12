import { Link } from 'react-router-dom';
import { Plus, Lightbulb, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCuratedIdeas, type OpenIdea } from '@/hooks/useOpenIdeas';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { sanitizeText } from '@/lib/sanitize';

// Environment variable for gating (could be set in production)
const REQUIRE_AUTH = true; // Set this based on your preference

function OpenIdeaCard({ idea }: { idea: OpenIdea }) {
  const snippet = sanitizeText(idea.content).slice(0, 200) + (idea.content.length > 200 ? '...' : '');
  const timeAgo = formatDistanceToNow(new Date(idea.created_at), { addSuffix: true });

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <Lightbulb className="w-6 h-6 text-primary" />
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-4">
          {snippet}
        </p>
        <Link to={`/brainstorms/new?idea_id=${idea.id}`}>
          <Button variant="outline" className="w-full">
            Get inspired → Start a brainstorm
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function OpenIdeas() {
  const { user } = useAuth();
  const { data: ideas = [], isLoading } = useCuratedIdeas();

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

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-6 mb-4" />
              <Skeleton className="h-20 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </Card>
          ))}
        </div>
      ) : ideas.length === 0 ? (
        <div className="text-center py-12">
          <Lightbulb className="w-16 h-16 mx-auto mb-4 text-primary opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No ideas available yet</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to contribute an idea to our community bank!
          </p>
          <Link to="/open-ideas/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Submit Your First Idea
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea) => (
            <OpenIdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </div>
  );
}