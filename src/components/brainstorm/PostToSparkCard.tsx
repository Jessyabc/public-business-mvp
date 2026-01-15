import { useEffect, useState } from 'react';
import { BasePost } from '@/types/post';
import { SparkCard } from './SparkCard';
import type { Spark } from './BrainstormLayout';
import { supabase } from '@/integrations/supabase/client';
import { useBrainstormExperienceStore } from '@/features/brainstorm/stores/experience';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

/**
 * Converts a BasePost to a Spark for use with SparkCard
 */
function convertPostToSpark(post: BasePost, authorDisplayName?: string | null, authorAvatarUrl?: string | null): Spark {
  return {
    id: post.id,
    title: post.title || null,
    body: post.body || post.content,
    created_at: post.created_at,
    author_display_name: authorDisplayName || null,
    author_avatar_url: authorAvatarUrl || null,
    is_anonymous: false,
    t_score: post.t_score || 0,
    u_score: post.u_score || null,
    kind: post.kind,
    mode: post.mode,
    view_count: post.views_count || 0,
    has_given_thought: false,
  };
}

interface PostToSparkCardProps {
  post: BasePost;
  variant?: 'default' | 'compact';
  showActions?: boolean;
  metaLabel?: string;
  onSelect?: (post: BasePost) => void;
  /** Pre-fetched author display name (from batch lookup) */
  authorDisplayName?: string | null;
}

/**
 * Wrapper component that converts BasePost to Spark and renders SparkCard
 * This replaces BrainstormPostCard to use the canonical SparkCard component
 * 
 * Performance optimization: Pass authorDisplayName prop from parent to avoid
 * individual profile lookups per card.
 */
export function PostToSparkCard({
  post,
  variant = 'default',
  showActions = true,
  metaLabel,
  onSelect,
  authorDisplayName: preloadedAuthorName,
}: PostToSparkCardProps) {
  const [authorDisplayName, setAuthorDisplayName] = useState<string | null>(preloadedAuthorName ?? null);
  const [authorAvatarUrl, setAuthorAvatarUrl] = useState<string | null>(null);
  const setActivePost = useBrainstormExperienceStore((state) => state.setActivePost);
  const { user } = useAuth();
  
  // Only fetch author profile if not provided as prop
  useEffect(() => {
    // Skip if we already have the name from props
    if (preloadedAuthorName !== undefined) {
      setAuthorDisplayName(preloadedAuthorName);
      return;
    }
    
    const fetchAuthor = async () => {
      if (!post.user_id) return;

      const { data } = await supabase
        .from('profile_cards')
        .select('display_name')
        .eq('id', post.user_id)
        .maybeSingle();

      if (data) {
        setAuthorDisplayName(data.display_name);
      }
    };

    fetchAuthor();
  }, [post.user_id, preloadedAuthorName]);

  // Listen for spark interaction events from SparkCard
  useEffect(() => {
    const handleThought = async (event: CustomEvent) => {
      if (event.detail.sparkId !== post.id) return;
      
      await supabase.functions.invoke('interact-post', {
        body: {
          post_id: post.id,
          type: 'like'
        }
      });
    };

    const handleView = async (event: CustomEvent) => {
      if (event.detail.sparkId !== post.id) return;
      
      await supabase.functions.invoke('interact-post', {
        body: {
          post_id: post.id,
          type: 'view'
        }
      });
    };

    window.addEventListener('pb:spark:thought', handleThought as EventListener);
    window.addEventListener('pb:spark:view', handleView as EventListener);

    return () => {
      window.removeEventListener('pb:spark:thought', handleThought as EventListener);
      window.removeEventListener('pb:spark:view', handleView as EventListener);
    };
  }, [post.id]);

  const spark = convertPostToSpark(post, authorDisplayName, authorAvatarUrl);

  const handleContinueBrainstorm = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to continue this Spark',
        variant: 'destructive',
      });
      return;
    }

    window.dispatchEvent(
      new CustomEvent('pb:brainstorm:continue', {
        detail: { 
          parentId: post.id,
          parentContent: post.content,
        }
      })
    );
  };

  const handleView = () => {
    if (onSelect) {
      onSelect(post);
    } else {
      setActivePost(post);
      window.dispatchEvent(
        new CustomEvent('pb:brainstorm:show-thread', {
          detail: { post, postId: post.id },
        })
      );
    }
  };

  return (
    <div className={variant === 'compact' ? 'compact-spark-card' : ''}>
      <SparkCard
        spark={spark}
        onContinueBrainstorm={handleContinueBrainstorm}
        onView={handleView}
      />
      {metaLabel && (
        <div className="text-xs text-muted-foreground mt-1">{metaLabel}</div>
      )}
    </div>
  );
}
