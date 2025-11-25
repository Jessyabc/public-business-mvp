import { useEffect, useState } from 'react';
import { BasePost } from '@/types/post';
import { SparkCard } from './SparkCard';
import type { Spark } from './BrainstormLayout';
import { supabase } from '@/integrations/supabase/client';
import { useBrainstormExperienceStore } from '@/features/brainstorm/stores/experience';

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
    is_anonymous: false, // BasePost doesn't have anonymous flag, default to false
    t_score: post.t_score || 0,
    view_count: post.views_count || 0,
    has_given_thought: false, // Would need to check user's interactions
  };
}

interface PostToSparkCardProps {
  post: BasePost;
  variant?: 'default' | 'compact';
  showActions?: boolean;
  metaLabel?: string;
  onSelect?: (post: BasePost) => void;
}

/**
 * Wrapper component that converts BasePost to Spark and renders SparkCard
 * This replaces BrainstormPostCard to use the canonical SparkCard component
 */
export function PostToSparkCard({
  post,
  variant = 'default',
  showActions = true,
  metaLabel,
  onSelect,
}: PostToSparkCardProps) {
  const [authorDisplayName, setAuthorDisplayName] = useState<string | null>(null);
  const [authorAvatarUrl, setAuthorAvatarUrl] = useState<string | null>(null);
  const setActivePost = useBrainstormExperienceStore((state) => state.setActivePost);

  // Fetch author profile
  useEffect(() => {
    const fetchAuthor = async () => {
      if (!post.user_id) return;

      const { data } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', post.user_id)
        .maybeSingle();

      if (data) {
        setAuthorDisplayName(data.display_name);
        setAuthorAvatarUrl(data.avatar_url);
      }
    };

    fetchAuthor();
  }, [post.user_id]);

  const spark = convertPostToSpark(post, authorDisplayName, authorAvatarUrl);

  const handleContinueBrainstorm = () => {
    if (onSelect) {
      onSelect(post);
    } else {
      setActivePost(post);
      window.dispatchEvent(
        new CustomEvent('pb:brainstorm:continue', {
          detail: { parentId: post.id },
        })
      );
    }
  };

  const handleView = () => {
    if (onSelect) {
      onSelect(post);
    } else {
      setActivePost(post);
      window.dispatchEvent(
        new CustomEvent('pb:brainstorm:show-lineage', {
          detail: { postId: post.id },
        })
      );
    }
  };

  // For compact variant, we might want to adjust styling
  // SparkCard doesn't have a variant prop, so we'll handle it via CSS if needed
  return (
    <div onClick={handleView} className={variant === 'compact' ? 'compact-spark-card' : ''}>
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

