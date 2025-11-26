import { useState, useEffect, useCallback, useRef } from 'react';
import { FeedContainer } from '@/features/feed/FeedContainer';
import { BrainstormLayoutShell } from '@/features/brainstorm/components/BrainstormLayoutShell';
import { ComposerModal } from '@/components/composer/ComposerModal';
import { PostLineageOverlay } from '@/components/brainstorm/PostLineageOverlay';
import { BrainstormThread } from '@/components/brainstorm/BrainstormThread';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { useBrainstormExperienceStore } from '@/features/brainstorm/stores/experience';
import { PostModal } from '@/components/post/PostModal';
import { supabase } from '@/integrations/supabase/client';
import type { Post, BasePost } from '@/types/post';

export default function BrainstormFeed() {
  const activePostId = useBrainstormExperienceStore(state => state.activePostId);
  const [composerOpen, setComposerOpen] = useState(false);
  const [activePostForLineage, setActivePostForLineage] = useState<BasePost | null>(null);
  const [activePostForThread, setActivePostForThread] = useState<BasePost | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const loadingRef = useRef(false);

  // Clear all state on mount to ensure clean start - no overlays on page load
  // This MUST run first, before any other effects
  useEffect(() => {
    // Immediately clear all local state to prevent any overlays from showing
    setActivePostForLineage(null);
    setActivePostForThread(null);
    setSelectedPostId(null);
    setSelectedPost(null);
    setComposerOpen(false);
    
    // Clear store's activePostId if it exists (prevents persisted state from triggering overlays)
    const currentActivePostId = useBrainstormExperienceStore.getState().activePostId;
    if (currentActivePostId) {
      useBrainstormExperienceStore.setState({ activePostId: null });
    }
    
    // Mark that initial mount is complete - allow modals to show after this
    setIsInitialMount(false);
  }, []); // Only run on mount - this ensures clean state on every page load/refresh

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

  const handleCloseOverlay = () => {
    setActivePostForLineage(null);
  };
  
  const handleCloseThread = () => {
    setActivePostForThread(null);
  };

  // Listen for continue and lineage events
  useEffect(() => {
    const handleContinue = (e: Event) => {
      const customEvent = e as CustomEvent;
      const parentId = customEvent.detail?.parentId;
      if (parentId) {
        setComposerOpen(true);
      }
    };
    const handleShowLineage = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const post = customEvent.detail?.post;
      if (post) {
        setActivePostForLineage(post);
      }
    };
    const handleShowThread = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const postId = customEvent.detail?.postId;
      const post = customEvent.detail?.post;
      
      if (post) {
        // Post object provided directly
        setActivePostForThread(post as BasePost);
      } else if (postId) {
        // Only postId provided, fetch the post
        const fetchedPost = await fetchPostById(postId);
        if (fetchedPost) {
          setActivePostForThread(fetchedPost as BasePost);
        }
      }
    };
    window.addEventListener('pb:brainstorm:continue', handleContinue);
    window.addEventListener('pb:brainstorm:show-lineage', handleShowLineage);
    window.addEventListener('pb:brainstorm:show-thread', handleShowThread);
    return () => {
      window.removeEventListener('pb:brainstorm:continue', handleContinue);
      window.removeEventListener('pb:brainstorm:show-lineage', handleShowLineage);
      window.removeEventListener('pb:brainstorm:show-thread', handleShowThread);
    };
  }, [fetchPostById]);

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
      <BrainstormLayoutShell
        main={<FeedContainer mode="brainstorm_main" activePostId={activePostId} />}
        crossLinks={null}
        sidebar={<RightSidebar variant="feed" onSelectPost={handleSelectPost} />}
      />
      <ComposerModal isOpen={composerOpen} onClose={() => setComposerOpen(false)} />
      
      {/* Brainstorm Thread - primary view when clicking a Spark from feed - only show after initial mount */}
      {!isInitialMount && activePostForThread && (
        <BrainstormThread rootPost={activePostForThread} onClose={handleCloseThread} />
      )}
      
      {/* Legacy Lineage Overlay - for backward compatibility (only show after initial mount and when explicitly triggered) */}
      {!isInitialMount && activePostForLineage && (
        <PostLineageOverlay activePost={activePostForLineage} onClose={handleCloseOverlay} />
      )}
      
      {/* Post Modal for sidebar breadcrumb clicks - only show after initial mount and when explicitly triggered */}
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
    </>
  );
}