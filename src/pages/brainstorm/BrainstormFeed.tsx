import { useState, useEffect, useCallback, useRef } from 'react';
import { FeedContainer } from '@/features/feed/FeedContainer';
import { BrainstormLayoutShell } from '@/features/brainstorm/components/BrainstormLayoutShell';
import { CrossLinksFeed } from '@/features/brainstorm/components/CrossLinksFeed';
import { ComposerModal } from '@/components/composer/ComposerModal';
import { PostLineageOverlay } from '@/components/brainstorm/PostLineageOverlay';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { useBrainstormExperienceStore } from '@/features/brainstorm/stores/experience';
import { PostModal } from '@/components/post/PostModal';
import { supabase } from '@/integrations/supabase/client';
import type { Post, BasePost } from '@/types/post';

export default function BrainstormFeed() {
  const activePostId = useBrainstormExperienceStore(state => state.activePostId);
  const [composerOpen, setComposerOpen] = useState(false);
  const [activePostForLineage, setActivePostForLineage] = useState<BasePost | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const loadingRef = useRef(false);

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
    window.addEventListener('pb:brainstorm:continue', handleContinue);
    window.addEventListener('pb:brainstorm:show-lineage', handleShowLineage);
    return () => {
      window.removeEventListener('pb:brainstorm:continue', handleContinue);
      window.removeEventListener('pb:brainstorm:show-lineage', handleShowLineage);
    };
  }, []);

  const handleCloseOverlay = () => {
    setActivePostForLineage(null);
  };

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

  // Load post when selectedPostId changes
  useEffect(() => {
    if (selectedPostId) {
      fetchPostById(selectedPostId).then((post) => {
        if (post) {
          setSelectedPost(post);
        } else {
          setSelectedPost(null);
          setSelectedPostId(null);
        }
      });
    } else {
      setSelectedPost(null);
    }
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
        crossLinks={<CrossLinksFeed postId={activePostId} />}
        sidebar={<RightSidebar variant="feed" onSelectPost={handleSelectPost} />}
      />
      <ComposerModal isOpen={composerOpen} onClose={() => setComposerOpen(false)} />
      <PostLineageOverlay activePost={activePostForLineage} onClose={handleCloseOverlay} />
      
      {/* Post Modal for sidebar breadcrumb clicks */}
      {selectedPost && selectedPostId && (
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