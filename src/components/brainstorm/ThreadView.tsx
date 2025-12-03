/**
 * ThreadView component
 * 
 * Displays a thread of posts connected by hard relations (continuations).
 * Uses VisionOS-inspired design with glassmorphism and clean spacing.
 */

import { useEffect, useState } from 'react';
import { useThreadView, flattenThread } from '@/hooks/useThreadView';
import { PostToSparkCard } from './PostToSparkCard';
import { Loader2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { LineageCard } from './LineageCard';
import { CrossLinksSection } from './CrossLinksSection';
import { UScoreRating } from '@/components/posts/UScoreRating';
import { usePostRating } from '@/hooks/usePostRating';

interface ThreadViewProps {
  postId: string;
  onClose?: () => void;
}

export function ThreadView({ postId, onClose }: ThreadViewProps) {
  const { data: threadData, isLoading, error } = useThreadView(postId);
  const [authorNames, setAuthorNames] = useState<Map<string, string>>(new Map());
  const { userRating, averageScore, ratingCount, submitRating } = usePostRating(postId);

  // Fetch author names for all posts in thread
  useEffect(() => {
    if (!threadData?.allPosts) return;

    const fetchAuthors = async () => {
      const userIds = Array.from(new Set(threadData.allPosts.map((p) => p.user_id)));
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds);

      if (profiles) {
        const names = new Map<string, string>();
        profiles.forEach((profile) => {
          names.set(profile.id, profile.display_name || 'Unknown');
        });
        setAuthorNames(names);
      }
    };

    fetchAuthors();
  }, [threadData?.allPosts]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-white/60" />
      </div>
    );
  }

  if (error || !threadData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white/70 text-sm">Failed to load thread</div>
      </div>
    );
  }

  const flatThread = flattenThread(threadData.threadTree);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-xl font-semibold text-white">Thread</h2>
        <div className="text-sm text-white/60">
          {flatThread.length} {flatThread.length === 1 ? 'post' : 'posts'}
        </div>
      </div>

      {/* Lineage Card */}
      <LineageCard postId={postId} currentPost={threadData.rootPost} />

      {/* U-Score Rating for root post */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <UScoreRating
          postId={postId}
          currentScore={averageScore}
          ratingCount={ratingCount}
          userRating={userRating}
          onRate={submitRating}
        />
      </div>

      {/* Thread backbone */}
      <div className="space-y-4">
        {flatThread.map((node, index) => (
          <div key={node.post.id} className="relative">
            {/* Depth indicator / connector */}
            {node.depth > 0 && (
              <div className="flex items-center gap-2 mb-2 ml-8">
                <div className="flex items-center gap-1.5 text-white/40 text-xs">
                  <ChevronRight className="w-3 h-3" />
                  <span>Continued by {authorNames.get(node.post.user_id) || 'Unknown'}</span>
                </div>
              </div>
            )}

            {/* Post card with depth indentation */}
            <div
              className={cn(
                'transition-all duration-200',
                node.depth > 0 && 'ml-12'
              )}
            >
              <PostToSparkCard
                post={node.post}
                showActions={true}
              />
            </div>

            {/* Visual connector to next post */}
            {index < flatThread.length - 1 && (
              <div
                className={cn(
                  'h-4 border-l-2 border-white/10 ml-6',
                  flatThread[index + 1].depth > node.depth && 'ml-14'
                )}
              />
            )}

            {/* Branch indicator for multiple children */}
            {node.children.length > 1 && (
              <div className="mt-2 ml-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  <span className="text-xs text-white/60">
                    {node.children.length} branches
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cross-links Section */}
      <CrossLinksSection postId={postId} />
    </div>
  );
}
