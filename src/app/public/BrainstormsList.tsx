import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBrainstormsStore } from '@/stores/brainstormsStore';
import { BrainstormCard } from '@/components/BrainstormCard';
import { BrainstormComposer } from './BrainstormComposer';
import { SkeletonList } from '@/ui/feedback/Skeleton';
import { Page } from '@/ui/layouts/Page';
import { trackBrainstormListViewed } from '@/lib/track';

export function BrainstormsList() {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<'recent' | 'score'>('recent');
  
  const { 
    loading, 
    error, 
    optimisticInserts,
    loadRoots, 
    createBrainstorm, 
    clearError,
    getRootBrainstorms
  } = useBrainstormsStore();

  const brainstorms = getRootBrainstorms(sortBy);

  useEffect(() => {
    loadRoots();
    trackBrainstormListViewed(sortBy, brainstorms.length);
  }, [loadRoots, sortBy, brainstorms.length]);

  const handleNewBrainstorm = async (text: string) => {
    await createBrainstorm({ text });
  };

  const handleBrainstormClick = (id: string) => {
    // Navigate to most recent if default route
    if (window.location.pathname === '/public/brainstorms' && brainstorms.length > 0) {
      navigate(`/public/brainstorms/${brainstorms[0].id}`, { replace: true });
    } else {
      navigate(`/public/brainstorms/${id}`);
    }
  };

  if (loading && brainstorms.length === 0) {
    return (
      <Page>
        <div className="space-y-6 pt-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Brainstorms</h1>
            <p className="text-muted-foreground">Loading ideas...</p>
          </div>
          <SkeletonList count={6} />
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="space-y-6 pt-8" role="main">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Brainstorms</h1>
          <p className="text-muted-foreground">Explore ideas and join the conversation</p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy(sortBy === 'recent' ? 'score' : 'recent')}
              className="flex items-center gap-2"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortBy === 'recent' ? 'Most Recent' : 'Highest T-Score'}
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {brainstorms.length} brainstorms
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center justify-between">
            <p className="text-destructive text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </div>
        )}

        {/* Composer */}
        <BrainstormComposer onSubmit={handleNewBrainstorm} />

        {/* Brainstorms List */}
        <div className="space-y-4" aria-live="polite" aria-label="Brainstorms list">
          {brainstorms.map((brainstorm) => (
            <BrainstormCard
              key={brainstorm.id}
              brainstorm={brainstorm}
              isOptimistic={optimisticInserts.has(brainstorm.id)}
              onClick={() => handleBrainstormClick(brainstorm.id)}
            />
          ))}
        </div>

        {brainstorms.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No brainstorms yet. Be the first to share an idea!</p>
          </div>
        )}
      </div>
    </Page>
  );
}