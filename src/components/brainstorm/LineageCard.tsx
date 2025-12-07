/**
 * LineageCard component
 * 
 * Shows the ancestry of a post in the thread, displaying the lineage
 * of hard relations back to the root Spark.
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Post } from '@/types/post';
import { ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LineageCardProps {
  postId: string;
  currentPost: Post;
  onSelectPost?: (post: Post) => void;
}

interface LineageNode {
  post: Post;
  authorName: string;
}

export function LineageCard({ postId, currentPost, onSelectPost }: LineageCardProps) {
  const [lineage, setLineage] = useState<LineageNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLineage = async () => {
      setIsLoading(true);
      try {
        // Fetch all reply relations going backward from current post
        const { data: relations } = await supabase
          .from('post_relations')
          .select('*')
          .eq('child_post_id', postId)
          .eq('relation_type', 'reply')
          .order('created_at', { ascending: true });

        if (!relations || relations.length === 0) {
          setLineage([]);
          setIsLoading(false);
          return;
        }

        // Collect all parent post IDs
        const parentIds = relations.map((rel) => rel.parent_post_id);
        
        // Fetch all parent posts
        const { data: posts } = await supabase
          .from('posts')
          .select('*')
          .in('id', parentIds)
          .eq('status', 'active');

        if (!posts || posts.length === 0) {
          setLineage([]);
          setIsLoading(false);
          return;
        }

        // Fetch author names using profile_cards view for safer public access
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

        // Build lineage array (most recent parent first)
        const lineageNodes: LineageNode[] = posts.map((post) => ({
          post: post as Post,
          authorName: authorMap.get(post.user_id) || 'Unknown',
        }));

        setLineage(lineageNodes.reverse()); // Reverse to show oldest parent first
      } catch (error) {
        console.error('Failed to fetch lineage:', error);
        setLineage([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLineage();
  }, [postId]);

  const handleNodeClick = (node: LineageNode) => {
    if (onSelectPost) {
      onSelectPost(node.post);
    }
  };

  if (isLoading) {
    return null;
  }

  if (lineage.length === 0) {
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
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-white">Thread Lineage</h3>
      </div>

      {/* Lineage chain */}
      <div className="flex items-center gap-2 flex-wrap">
        {lineage.map((node, index) => (
          <div key={node.post.id} className="flex items-center gap-2">
            {/* Parent node */}
            <div
              onClick={() => handleNodeClick(node)}
              className={cn(
                'px-3 py-1.5 rounded-lg cursor-pointer',
                'bg-white/5 border border-white/15',
                'transition-all duration-200 hover:bg-white/10 hover:border-primary/40'
              )}
            >
              <div className="text-xs text-white/90 font-medium">
                {node.authorName}
              </div>
              <div className="text-[10px] text-white/60 truncate max-w-[120px]">
                {node.post.title || node.post.content.slice(0, 30)}...
              </div>
            </div>

            {/* Arrow connector */}
            {index < lineage.length - 1 && (
              <ChevronRight className="w-3 h-3 text-white/40 flex-shrink-0" />
            )}
          </div>
        ))}

        {/* Arrow to current post */}
        <ChevronRight className="w-3 h-3 text-white/40 flex-shrink-0" />

        {/* Current post indicator */}
        <div
          className={cn(
            'px-3 py-1.5 rounded-lg',
            'bg-primary/20 border border-primary/40',
            'shadow-[0_0_20px_rgba(72,159,227,0.3)]'
          )}
        >
          <div className="text-xs text-white font-medium">Current Post</div>
          <div className="text-[10px] text-white/80 truncate max-w-[120px]">
            {currentPost.title || currentPost.content.slice(0, 30)}...
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 text-xs text-white/50">
        This post continues a thread with {lineage.length} {lineage.length === 1 ? 'parent' : 'parents'}
      </div>
    </div>
  );
}
