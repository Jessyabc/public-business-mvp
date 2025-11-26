import { useEffect, useState } from 'react';
import { BasePost } from '@/types/post';
import { SparkCard } from './SparkCard';
import type { Spark } from './BrainstormLayout';
import { supabase } from '@/integrations/supabase/client';
import { useBrainstormExperienceStore } from '@/features/brainstorm/stores/experience';
import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  
  // Check if this Spark originated from an Open Idea
  const originOpenIdeaId = post.metadata && typeof post.metadata === 'object' && 'origin_open_idea_id' in post.metadata
    ? (post.metadata as any).origin_open_idea_id as string
    : null;

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
    // Always dispatch the continue event to open composer
    // This should not be overridden by onSelect (which is for view/click behavior)
    setActivePost(post);
    window.dispatchEvent(
      new CustomEvent('pb:brainstorm:continue', {
        detail: { parentId: post.id },
      })
    );
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

  const handleOpenIdeaClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card's onClick
    if (originOpenIdeaId) {
      // Navigate to open ideas page
      // Note: We can't easily focus a specific item, but we can navigate there
      navigate('/open-ideas');
      // Optionally, we could dispatch an event to open the specific idea modal
      // For now, just navigate to the page
    }
  };

  // For compact variant, we might want to adjust styling
  // SparkCard doesn't have a variant prop, so we'll handle it via CSS if needed
  return (
    <div className={variant === 'compact' ? 'compact-spark-card' : ''}>
      <SparkCard
        spark={spark}
        onContinueBrainstorm={handleContinueBrainstorm}
        onView={handleView}
      />
      {/* Origin badge */}
      {originOpenIdeaId && (
        <div className="mt-2 flex items-center">
          <Badge
            variant="outline"
            className="text-xs bg-white/5 border-white/20 text-white/70 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
            onClick={handleOpenIdeaClick}
          >
            <Lightbulb className="w-3 h-3 mr-1" />
            Origin: Open Idea
          </Badge>
        </div>
      )}
      {metaLabel && (
        <div className="text-xs text-muted-foreground mt-1">{metaLabel}</div>
      )}
    </div>
  );
}

