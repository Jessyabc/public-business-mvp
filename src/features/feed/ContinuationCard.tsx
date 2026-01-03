import { cn } from '@/lib/utils';
import { PostToSparkCard } from '@/components/brainstorm/PostToSparkCard';
import type { ContinuationNode } from '@/lib/clusterUtils';
import type { BasePost } from '@/types/post';

interface ContinuationCardProps {
  continuation: ContinuationNode;
  depth: number;
  isExpanded?: boolean;
  onSelect: (postId: string) => void;
}

export function ContinuationCard({
  continuation,
  depth,
  isExpanded = false,
  onSelect,
}: ContinuationCardProps) {
  const handleSelect = (post: BasePost) => {
    // PostToSparkCard calls onSelect with the post, but parent expects postId
    onSelect(post.id);
  };

  return (
    <div className={cn(
      "relative transition-all duration-200",
      depth === 1 ? "pl-6" : depth === 2 ? "pl-8" : "pl-10", // Indentation increases with depth
      "opacity-90" // Reduced opacity compared to anchor
    )}>
      {/* Connection line - solid blue glowing for continuations (hard links) */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-0.5 pointer-events-none"
        style={{
          background: 'hsl(var(--accent))',
          boxShadow: '0 0 8px hsl(var(--accent)), 0 0 4px hsl(var(--accent))80',
          opacity: 0.9,
        }}
      />
      
      {/* Continuation card */}
      <div className={cn(
        "relative",
        "transition-all duration-200"
      )}>
        <div 
          className={cn(
            "rounded-2xl overflow-hidden",
            "backdrop-blur-xl",
            "bg-white/5 dark:bg-white/8",
            "border border-white/10",
            "shadow-[0_0_10px_rgba(0,0,0,0.15)]",
            depth === 1 ? "text-sm" : depth === 2 ? "text-xs" : "text-xs", // Typography scales with depth
            "opacity-90", // Reduced opacity
            "hover:opacity-100 hover:shadow-[0_0_15px_rgba(72,159,227,0.2)] transition-all"
          )}
        >
          <PostToSparkCard
            post={continuation.post}
            onSelect={handleSelect}
          />
        </div>
      </div>
    </div>
  );
}

