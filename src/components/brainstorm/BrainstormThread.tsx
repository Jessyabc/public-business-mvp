import { useState, useCallback } from 'react';
import { BasePost } from '@/types/post';
import { PostLineageOverlay } from './PostLineageOverlay';
import { PostModal } from '@/components/post/PostModal';
import { supabase } from '@/integrations/supabase/client';
import type { Post } from '@/types/post';

interface BrainstormThreadProps {
  rootPost: BasePost | null;
  onClose: () => void;
}

/**
 * BrainstormThread component - shows a root Spark and its relations.
 * Clicking nodes in the thread opens individual Post Cards (PostModal).
 * This is the primary view when clicking a Spark from the feed.
 */
export function BrainstormThread({ rootPost, onClose }: BrainstormThreadProps) {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Fetch post details for PostModal
  const fetchPostForModal = useCallback(async (postId: string): Promise<Post | null> => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error fetching post:', error);
        return null;
      }

      return data as Post;
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  }, []);

  // Handle opening a post card from the thread
  const handleOpenPostCard = useCallback(async (post: BasePost) => {
    setSelectedPostId(post.id);
    const fullPost = await fetchPostForModal(post.id);
    if (fullPost) {
      setSelectedPost(fullPost);
    } else {
      setSelectedPostId(null);
    }
  }, [fetchPostForModal]);

  // Close post modal
  const handleClosePostModal = useCallback(() => {
    setSelectedPostId(null);
    setSelectedPost(null);
  }, []);

  return (
    <>
      <PostLineageOverlay
        activePost={rootPost}
        onClose={onClose}
        onOpenPostCard={handleOpenPostCard}
        mode="thread"
        title="Brainstorm Thread"
      />
      
      {/* Post Card Modal - shows individual post details */}
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

