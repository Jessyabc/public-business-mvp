import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTrailStore, type TrailItem } from '@/stores/trailStore';

interface RightSidebarProps {
  variant?: 'default' | 'feed';
  onSelectPost?: (postId: string) => void;
}

export function RightSidebar({
  variant = 'default',
  onSelectPost
}: RightSidebarProps) {
  const { trail, addToTrail, clearTrail } = useTrailStore();

  // Listen for post view events to add to trail
  useEffect(() => {
    const handleShowThread = (e: CustomEvent<{ post?: { id: string; title?: string; content: string }; postId?: string }>) => {
      if (e.detail.post) {
        addToTrail({
          id: e.detail.post.id,
          title: e.detail.post.title || null,
          content: e.detail.post.content,
        });
      }
    };

    window.addEventListener('pb:brainstorm:show-thread', handleShowThread as EventListener);
    return () => {
      window.removeEventListener('pb:brainstorm:show-thread', handleShowThread as EventListener);
    };
  }, [addToTrail]);

  if (variant === 'feed') {
    if (trail.length === 0) {
      return (
        <div className={cn(
          "h-full overflow-y-auto rounded-2xl p-4",
          "bg-black/30 backdrop-blur-sm",
          "border border-white/10",
          "shadow-[inset_0_0_30px_rgba(72,159,227,0.05)]"
        )}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
              Your Trail
            </h3>
          </div>
          <p className="text-sm text-white/50 text-center py-8">
            Posts you view will appear here as breadcrumbs.
          </p>
        </div>
      );
    }
    
    return (
      <div className={cn(
        "h-full overflow-y-auto rounded-2xl p-4",
        "bg-black/30 backdrop-blur-sm",
        "border border-white/10",
        "shadow-[inset_0_0_30px_rgba(72,159,227,0.05)]"
      )}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
            Your Trail
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearTrail}
            className="text-white/40 hover:text-white/70 h-6 px-2"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </div>
        
        <ol className="space-y-3">
          {trail.map((item, index) => (
            <li key={item.id} className="flex items-start gap-3 text-left group">
              {/* Numbered indicator with glow */}
              <span className={cn(
                "mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full",
                "bg-gradient-to-br from-white/20 to-white/5",
                "border border-white/20",
                "font-semibold text-white/80 text-center text-xs",
                "shadow-[0_0_10px_rgba(72,159,227,0.2)]",
                "group-hover:shadow-[0_0_15px_rgba(72,159,227,0.4)]",
                "transition-all duration-300"
              )}>
                {index + 1}
              </span>
              
              <button
                onClick={() => onSelectPost?.(item.id)}
                className="flex-1 text-left group/card"
              >
                <div className={cn(
                  "p-3 rounded-xl",
                  "bg-white/5 backdrop-blur-sm",
                  "border border-white/10",
                  "hover:bg-white/10 hover:border-white/20",
                  "hover:shadow-[0_0_20px_rgba(72,159,227,0.15)]",
                  "transition-all duration-300 cursor-pointer"
                )}>
                  {item.title && (
                    <p className="text-sm font-semibold text-white/90 mb-1 line-clamp-1">
                      {item.title}
                    </p>
                  )}
                  <p className="text-xs text-white/60 line-clamp-2">{item.content}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
                    {new Date(item.visitedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return null;
}

export default RightSidebar;
