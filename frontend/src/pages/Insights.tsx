import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ComposerModal } from '@/components/composer/ComposerModal';
import { useComposerStore } from '@/hooks/useComposerStore';
import { usePosts } from '@/hooks/usePosts';
import { useUserOrgId } from '@/features/orgs/hooks/useUserOrgId';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Insights = () => {
  const { data: activeOrgId } = useUserOrgId();
  const { posts, loading, fetchPosts } = usePosts();
  const { isOpen, openComposer, closeComposer } = useComposerStore();

  // Filter for business insights in current org
  const insights = posts.filter(p => 
    p.kind === 'BusinessInsight' && 
    p.mode === 'business' && 
    p.org_id === activeOrgId
  );

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Organization Insights
          </h1>
          <p className="text-muted-foreground">
            Share insights with your organization members
          </p>
        </div>

        {activeOrgId ? (
          <>
            <Button onClick={() => openComposer()}>
              <Plus className="w-4 h-4 mr-2" />
              Share Insight
            </Button>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Loading insights...
                </div>
              ) : insights.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No insights yet. Be the first to share!
                </div>
              ) : (
                insights.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-lg border backdrop-blur-sm"
                  >
                    {post.title && <h3 className="font-semibold mb-2">{post.title}</h3>}
                    <p>{post.content}</p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="p-6 rounded-lg border backdrop-blur-sm text-center">
            <p className="text-muted-foreground">
              You need to be a member of an organization to share insights.
            </p>
          </div>
        )}
      </div>

      <ComposerModal isOpen={isOpen} onClose={closeComposer} />
    </ProtectedRoute>
  );
};

export default Insights;
