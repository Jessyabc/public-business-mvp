import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FeedContainer } from '@/features/feed/FeedContainer';
import { BrainstormLayoutShell } from '@/features/brainstorm/components/BrainstormLayoutShell';
import { ComposerModal } from '@/components/composer/ComposerModal';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { useBrainstormExperienceStore } from '@/features/brainstorm/stores/experience';
import { PostReaderModal } from '@/components/posts/PostReaderModal';
import { PullToRefresh } from '@/components/layout/PullToRefresh';
import { supabase } from '@/integrations/supabase/client';
import type { Post, BasePost } from '@/types/post';

export default function BrainstormFeed() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activePostId = useBrainstormExperienceStore(state => state.activePostId);
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const loadingRef = useRef(false);
  const [readerModalPost, setReaderModalPost] = useState<Post | null>(null);

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

  // Listen for post click events - open PostReaderModal
  useEffect(() => {
    const handleShowThread = async (event: CustomEvent) => {
      const { postId, post } = event.detail;
      if (post) {
        setReaderModalPost(post as Post);
      } else if (postId) {
        const fetchedPost = await fetchPostById(postId);
        if (fetchedPost) {
          setReaderModalPost(fetchedPost);
        }
      }
    };
    window.addEventListener('pb:brainstorm:show-thread', handleShowThread as EventListener);
    return () => window.removeEventListener('pb:brainstorm:show-thread', handleShowThread as EventListener);
  }, [fetchPostById]);

  // Check for post query parameter on mount and open reader modal
  useEffect(() => {
    const postId = searchParams.get('post');
    if (postId && !isInitialMount) {
      fetchPostById(postId).then((post) => {
        if (post) setReaderModalPost(post);
      });
      // Clear the query parameter after opening
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, isInitialMount, fetchPostById]);

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
      
      {/* Post Reader Modal for feed post clicks */}
      <PostReaderModal
        isOpen={!!readerModalPost}
        onClose={() => setReaderModalPost(null)}
        post={readerModalPost}
      />
    </>
  );
}