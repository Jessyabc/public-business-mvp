import { cn } from '@/lib/utils';
import { PostToSparkCard } from '@/components/brainstorm/PostToSparkCard';
import type { ContinuationNode } from '@/lib/clusterUtils';
import type { BasePost } from '@/types/post';

interface ContinuationCardProps {
  continuation: ContinuationNode;
  depth: number;
  isExpanded?: boolean;
  fadeOpacity?: number;
  onSelect: (postId: string) => void;
}

export function ContinuationCard({
  continuation,
  depth,
  isExpanded = false,
  fadeOpacity = 1,
  onSelect,
}: ContinuationCardProps) {
  const handleSelect = (post: BasePost) => {
    onSelect(post.id);
  };

  // Scale based on depth
  const scaleClass = depth === 1 ? 'scale-[0.97]' : depth === 2 ? 'scale-[0.95]' : 'scale-[0.93]';
  const indentClass = depth === 1 ? 'pl-6' : depth === 2 ? 'pl-10' : 'pl-14';

  return (
    <div 
      className={cn(
        "relative transition-all duration-300",
        indentClass
      )}
      style={{ opacity: fadeOpacity }}
    >
      {/* Connection line - solid blue glowing for continuations (hard links) */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-0.5 pointer-events-none"
        style={{
          background: 'hsl(var(--accent))',
          boxShadow: fadeOpacity > 0.7 
            ? '0 0 8px hsl(var(--accent)), 0 0 4px hsl(var(--accent))80' 
            : '0 0 4px hsl(var(--accent))40',
          opacity: fadeOpacity * 0.9,
        }}
      />
      
      {/* Continuation card */}
      <div className={cn(
        "relative transform origin-left",
        scaleClass,
        "transition-all duration-300"
      )}>
        <div 
          className={cn(
            "rounded-2xl overflow-hidden",
            "backdrop-blur-xl",
            "bg-white/5 dark:bg-white/8",
            "border border-white/10",
            "shadow-[0_0_10px_rgba(0,0,0,0.15)]",
            depth >= 2 ? "text-sm" : "text-base",
            "hover:shadow-[0_0_15px_rgba(72,159,227,0.2)] transition-all"
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

