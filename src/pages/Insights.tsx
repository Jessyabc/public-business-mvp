import { PostComposer } from '@/components/posts/PostComposer';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import type { Post } from '@/lib/types/post';
import { useState } from 'react';

const Insights = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  
  // TODO: Replace with actual org ID from context/auth
  const activeOrgId = undefined;

  const handlePostCreated = (post: Post) => {
    setPosts([post, ...posts]);
  };

  return (
    <ProtectedRoute requireAuth={true}>
      <MainLayout>
        <div className="max-w-4xl mx-auto space-y-6 p-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              Organization Insights
            </h1>
            <p className="text-[var(--text-secondary)]">
              Share insights with your organization members
            </p>
          </div>

          {activeOrgId ? (
            <>
              <PostComposer
                context="business"
                orgId={activeOrgId}
                onPostCreated={handlePostCreated}
              />

              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="text-center py-12 text-[var(--text-secondary)]">
                    No insights yet. Be the first to share!
                  </div>
                ) : (
                  posts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)]"
                    >
                      <p className="text-[var(--text-primary)]">{post.content}</p>
                      <div className="mt-2 text-xs text-[var(--text-secondary)]">
                        {new Date(post.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="p-6 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] text-center">
              <p className="text-[var(--text-secondary)]">
                You need to be a member of an organization to share insights.
              </p>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default Insights;
