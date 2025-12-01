import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type InteractionType = 'branch' | 'reply' | 'like' | 'share' | 'view';

interface UsePostInteractionsReturn {
  interacting: boolean;
  interactWithPost: (postId: string, type: InteractionType) => Promise<void>;
}

export function usePostInteractions(): UsePostInteractionsReturn {
  const [interacting, setInteracting] = useState(false);
  const { user } = useAuth();
  const viewedPostsRef = useState<Set<string>>(new Set())[0];

  const interactWithPost = async (postId: string, type: InteractionType) => {
    // Prevent duplicate views from same user in same session
    if (type === 'view') {
      if (viewedPostsRef.has(postId)) {
        return; // Already viewed in this session
      }
      viewedPostsRef.add(postId);
    }

    setInteracting(true);
    try {
      const { data, error } = await supabase.functions.invoke('interact-post', {
        body: {
          post_id: postId,
          type: type,
        },
      });

      if (error) {
        console.error('Error recording interaction:', error);
        if (type !== 'view') { // Don't show error toast for views
          toast.error('Failed to record interaction');
        }
        return;
      }

      // Show success message for certain interactions
      if (type === 'like') {
        toast.success('Post liked!');
      } else if (type === 'share') {
        toast.success('Post shared!');
      }

      console.log('Interaction recorded:', data);
    } catch (error) {
      console.error('Unexpected error during interaction:', error);
      if (type !== 'view') {
        toast.error('Failed to record interaction');
      }
    } finally {
      setInteracting(false);
    }
  };

  return {
    interacting,
    interactWithPost,
  };
}