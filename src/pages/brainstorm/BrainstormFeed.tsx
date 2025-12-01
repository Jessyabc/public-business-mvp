import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FeedContainer } from '@/features/feed/FeedContainer';
import { BrainstormLayoutShell } from '@/features/brainstorm/components/BrainstormLayoutShell';
import { ComposerModal } from '@/components/composer/ComposerModal';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { useBrainstormExperienceStore } from '@/features/brainstorm/stores/experience';
import { PostModal } from '@/components/post/PostModal';
import { PullToRefresh } from '@/components/layout/PullToRefresh';
import { supabase } from '@/integrations/supabase/client';
import type { Post, BasePost } from '@/types/post';
import { ThreadView } from '@/components/brainstorm/ThreadView';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function BrainstormFeed() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activePostId = useBrainstormExperienceStore(state => state.activePostId);
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const loadingRef = useRef(false);
  const [threadViewPostId, setThreadViewPostId] = useState<string | null>(null);

  const handleRefresh = async () => {
    setRefreshKey(prev => prev + 1);
  };

  // Clear all state on mount to ensure clean start - no overlays on page load
  useEffect(() => {
    setSelectedPostId(null);
    setSelectedPost(null);
    setComposerOpen(false);
    
    const currentActivePostId = useBrainstormExperienceStore.getState().activePostId;
    if (currentActivePostId) {
      useBrainstormExperienceStore.setState({ activePostId: null });
    }
    
    setIsInitialMount(false);
  }, []);

  // Memoized fetch function to prevent re-renders
  const fetchPostById = useCallback(async (id: string): Promise<Post | null> => {
    if (loadingRef.current) return null;
    
    loadingRef.current = true;
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      return data as Post;
    } catch (err) {
      console.error('Error fetching post:', err);
      return null;
    } finally {
      loadingRef.current = false;
    }
  }, []);

  // Listen for continue events
  useEffect(() => {
    const handleContinue = () => {
      setComposerOpen(true);
    };
    window.addEventListener('pb:brainstorm:continue', handleContinue);
    return () => window.removeEventListener('pb:brainstorm:continue', handleContinue);
  }, []);

  // Listen for thread view events
  useEffect(() => {
    const handleShowThread = (event: CustomEvent) => {
      const { postId } = event.detail;
      setThreadViewPostId(postId);
    };
    window.addEventListener('pb:brainstorm:show-thread', handleShowThread as EventListener);
    return () => window.removeEventListener('pb:brainstorm:show-thread', handleShowThread as EventListener);
  }, []);

  // Check for post query parameter on mount and open thread view
  useEffect(() => {
    const postId = searchParams.get('post');
    if (postId && !isInitialMount) {
      setThreadViewPostId(postId);
      // Clear the query parameter after opening
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, isInitialMount]);

  // Load post when selectedPostId changes (but only if it's explicitly set by user action)
  useEffect(() => {
    // Don't load if selectedPostId is null (clean state)
    if (!selectedPostId) {
      setSelectedPost(null);
      return;
    }
    
    // Only fetch if selectedPostId is actually set (user clicked something)
    fetchPostById(selectedPostId).then((post) => {
      if (post) {
        setSelectedPost(post);
      } else {
        setSelectedPost(null);
        setSelectedPostId(null);
      }
    });
  }, [selectedPostId, fetchPostById]);

  const handleSelectPost = useCallback((postId: string) => {
    // Only set if different to prevent unnecessary re-renders
    if (selectedPostId !== postId) {
      setSelectedPostId(postId);
    }
  }, [selectedPostId]);

  const handleClosePostModal = useCallback(() => {
    setSelectedPostId(null);
    setSelectedPost(null);
  }, []);

  return (
    <>
      <PullToRefresh onRefresh={handleRefresh}>
        <BrainstormLayoutShell
          main={<FeedContainer mode="brainstorm_main" activePostId={activePostId} key={refreshKey} />}
          crossLinks={null}
          sidebar={<RightSidebar variant="feed" onSelectPost={handleSelectPost} />}
        />
      </PullToRefresh>
      <ComposerModal isOpen={composerOpen} onClose={() => setComposerOpen(false)} />
      
      {/* Post Modal for sidebar breadcrumb clicks */}
      {!isInitialMount && selectedPost && selectedPostId && (
        <PostModal
          isOpen={true}
          onClose={handleClosePostModal}
          id={selectedPost.id}
          type="brainstorm"
          title={selectedPost.title || undefined}
          content={selectedPost.content}
          created_at={selectedPost.created_at}
          author={selectedPost.user_id || 'Anonymous'}
          stats={{
            views: selectedPost.views_count,
            likes: selectedPost.likes_count,
            comments: selectedPost.comments_count,
          }}
        />
      )}

      {/* Thread View Modal */}
      <Dialog open={!!threadViewPostId} onOpenChange={(open) => !open && setThreadViewPostId(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border border-white/10">
          {threadViewPostId && (
            <ThreadView
              postId={threadViewPostId}
              onClose={() => setThreadViewPostId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}