import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBrainstormsStore } from '@/stores/brainstormsStore';
import { BrainstormCard } from '@/components/BrainstormCard';
import { BrainstormComposer } from './BrainstormComposer';
import { Skeleton } from '@/ui/feedback/Skeleton';
import { Page } from '@/ui/layouts/Page';
import { GlassCard } from '@/ui/components/GlassCard';
import { trackBrainstormViewed } from '@/lib/track';

export function BrainstormDetail() {
  const { id } = useParams<{ id: string }>();
  
  const { 
    loading,
    error,
    optimisticInserts, 
    loadBranches, 
    createBrainstorm,
    clearError,
    getBrainstorm,
    getBranches
  } = useBrainstormsStore();

  const brainstorm = id ? getBrainstorm(id) : null;
  const branches = id ? getBranches(id) : [];

  useEffect(() => {
    if (id) {
      loadBranches(id);
      if (brainstorm) {
        trackBrainstormViewed(id, branches.length > 0);
      }
    }
  }, [id, loadBranches, brainstorm, branches.length]);

  const handleNewBranch = async (text: string) => {
    if (!id) return;
    await createBrainstorm({ text, parentId: id });
  };

  if (loading && !brainstorm) {
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
        <Link to="/public/brainstorms">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Brainstorms</span>
          </Button>
        </Link>

        {/* Error Alert */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center justify-between">
            <p className="text-destructive text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </div>
        )}

        {/* Main Brainstorm */}
        <div>
          <h1 className="sr-only">Brainstorm Detail</h1>
          <BrainstormCard brainstorm={brainstorm} showReplies={false} />
        </div>

        {/* Reply Composer */}
        <BrainstormComposer
          onSubmit={handleNewBranch}
          placeholder="Continue this brainstorm with your ideas..."
          parentId={brainstorm.id}
        />

        {/* Branches */}
        {branches.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <span>Continuations ({branches.length})</span>
            </h2>
            
            <div className="space-y-4" aria-live="polite" aria-label="Brainstorm replies">
              {branches.map((branch) => (
                <BrainstormCard
                  key={branch.id}
                  brainstorm={branch}
                  showReplies={false}
                  isOptimistic={optimisticInserts.has(branch.id)}
                />
              ))}
            </div>
          </div>
        )}
        
        {branches.length === 0 && (
          <GlassCard className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No continuations yet. Be the first to extend this brainstorm!</p>
          </GlassCard>
        )}
      </div>
    </Page>
  );
}