/**
 * ContinuationsCard component
 * 
 * Shows the continuations (children) of a post, allowing navigation to them.
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Post } from '@/types/post';
import { ArrowDown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContinuationsCardProps {
  postId: string;
  currentPost: Post;
  onSelectPost?: (post: Post) => void;
}

interface ContinuationNode {
  post: Post;
  authorName: string;
}

export function ContinuationsCard({ postId, currentPost, onSelectPost }: ContinuationsCardProps) {
  const [continuations, setContinuations] = useState<ContinuationNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContinuations = async () => {
      setIsLoading(true);
      try {
        // Fetch all continuation relations (children) from current post
        const { data: relations } = await supabase
          .from('post_relations')
          .select('*')
          .eq('parent_post_id', postId)
          .in('relation_type', ['reply', 'origin'])
          .order('created_at', { ascending: false });

        if (!relations || relations.length === 0) {
          setContinuations([]);
          setIsLoading(false);
          return;
        }

        // Collect all child post IDs
        const childIds = relations.map((rel) => rel.child_post_id);
        
        // Fetch all child posts
        const { data: posts } = await supabase
          .from('posts')
          .select('*')
          .in('id', childIds)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (!posts || posts.length === 0) {
          setContinuations([]);
          setIsLoading(false);
          return;
        }

        // Fetch author names using profile_cards view
        const userIds = Array.from(new Set(posts.map((p) => p.user_id)));
        const { data: profiles } = await supabase
          .from('profile_cards')
          .select('id, display_name')
          .in('id', userIds);

        const authorMap = new Map<string, string>();
        if (profiles) {
          profiles.forEach((profile) => {
            authorMap.set(profile.id, profile.display_name || 'Unknown');
          });
        }

        // Build continuations array
        const continuationNodes: ContinuationNode[] = posts.map((post) => ({
          post: post as Post,
          authorName: authorMap.get(post.user_id) || 'Unknown',
        }));

        setContinuations(continuationNodes);
      } catch (error) {
        console.error('Failed to fetch continuations:', error);
        setContinuations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContinuations();
  }, [postId]);

  const handleNodeClick = (node: ContinuationNode) => {
    if (onSelectPost) {
      onSelectPost(node.post);
    }
  };

  if (isLoading) {
    return null;
  }

  if (continuations.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'rounded-2xl p-4 mb-6',
        'bg-white/5 backdrop-blur-xl border border-white/10',
        'shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <ArrowDown className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-white">Continuations ({continuations.length})</h3>
      </div>

      {/* Continuations grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {continuations.map((node) => (
          <div
            key={node.post.id}
            onClick={() => handleNodeClick(node)}
            className={cn(
              'px-3 py-2 rounded-lg cursor-pointer',
              'bg-white/5 border border-white/15',
              'transition-all duration-200 hover:bg-white/10 hover:border-primary/40'
            )}
          >
            <div className="text-xs text-white/90 font-medium mb-1">
              {node.authorName}
            </div>
            <div className="text-[11px] text-white/70 truncate">
              {node.post.title || node.post.content.slice(0, 50)}...
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

