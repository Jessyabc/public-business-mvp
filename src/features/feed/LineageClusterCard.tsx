import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PostToSparkCard } from '@/components/brainstorm/PostToSparkCard';
import { ContinuationCard } from './ContinuationCard';
import { getTopContinuations, countDeeperContinuations, type LineageCluster } from '@/lib/clusterUtils';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { BasePost } from '@/types/post';

interface LineageClusterCardProps {
  cluster: LineageCluster;
  onSelectPost: (postId: string) => void;
  onExpandDeeper?: (clusterId: string) => void;
}

export function LineageClusterCard({
  cluster,
  onSelectPost,
  onExpandDeeper,
}: LineageClusterCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const topContinuations = getTopContinuations(cluster, 3);
  const deeperCount = countDeeperContinuations(cluster);
  const hasDeeper = deeperCount > 0;

  // Get level 2 and level 3 continuations (if expanded)
  const level2Continuations = isExpanded
    ? cluster.continuations.filter(c => c.depth === 2).slice(0, 5)
    : [];
  
  const level3Continuations = isExpanded
    ? cluster.continuations.filter(c => c.depth === 3).slice(0, 5)
    : [];

  const handleSparkSelect = (post: BasePost) => {
    // PostToSparkCard calls onSelect with the post, but parent expects postId
    onSelectPost(post.id);
  };

  const handleExpandDeeper = () => {
    if (hasDeeper) {
      if (onExpandDeeper) {
        onExpandDeeper(cluster.spark.id);
      } else {
        setIsExpanded(!isExpanded);
      }
    }
  };

  return (
    <div className="relative w-full">
      {/* Anchor Spark (Root) - Full-size card */}
      <div className="relative z-10">
        <PostToSparkCard
          post={cluster.spark}
          onSelect={handleSparkSelect}
        />
      </div>

      {/* Continuations Section */}
      {topContinuations.length > 0 && (
        <div className="mt-4 space-y-3">
          {topContinuations.map((continuation) => (
            <ContinuationCard
              key={continuation.post.id}
              continuation={continuation}
              depth={1}
              onSelect={onSelectPost}
            />
          ))}

          {/* Expanded Level 2 continuations */}
          {isExpanded && level2Continuations.length > 0 && (
            <div className="space-y-2">
              {level2Continuations.map((continuation) => (
                <ContinuationCard
                  key={continuation.post.id}
                  continuation={continuation}
                  depth={2}
                  isExpanded={true}
                  onSelect={onSelectPost}
                />
              ))}
            </div>
          )}

          {/* Expanded Level 3 continuations */}
          {isExpanded && level3Continuations.length > 0 && (
            <div className="space-y-2">
              {level3Continuations.map((continuation) => (
                <ContinuationCard
                  key={continuation.post.id}
                  continuation={continuation}
                  depth={3}
                  isExpanded={true}
                  onSelect={onSelectPost}
                />
              ))}
            </div>
          )}

          {/* Deeper continuations badge */}
          {hasDeeper && (
            <div className={cn(
              "pl-6 pt-2"
            )}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpandDeeper}
                className={cn(
                  "text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                  "hover:bg-white/5",
                  "border border-white/10 hover:border-white/20",
                  "rounded-lg px-3 py-1.5",
                  "transition-all duration-200"
                )}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-3 h-3 mr-1" />
                    Hide deeper continuations
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3 mr-1" />
                    + {deeperCount} deeper continuation{deeperCount !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

