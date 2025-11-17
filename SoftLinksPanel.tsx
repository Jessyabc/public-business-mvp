import { GlassCard } from '@/ui/components/GlassCard';
import { useBrainstormStore } from '../store';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

export default function SoftLinksPanel({ className }: Props) {
  const { softLinksForPost, selectById, selectedNodeId } = useBrainstormStore();
  const items = selectedNodeId ? softLinksForPost(selectedNodeId) : [];

  return (
    <GlassCard className={cn('p-4 md:p-5 h-full flex flex-col overflow-hidden', className)}>
      <div className="mb-3 text-[13px] uppercase tracking-wide text-foreground/70 font-medium">
        Soft Links
      </div>
      
      <div className="flex-1 overflow-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-foreground/20 scrollbar-track-transparent">
        {items.length === 0 ? (
          <div className="text-center text-foreground/50 text-sm py-8">
            No soft links yet
          </div>
        ) : (
          items.map((x) => (
            <button
              key={x.id}
              onClick={() => selectById(x.id)}
              className={cn(
                'w-full text-left rounded-xl px-3 py-2 transition-all',
                'bg-background/5 ring-1 ring-foreground/10 hover:bg-background/10',
                selectedNodeId === x.id && 'ring-2 ring-accent/40 bg-accent/10'
              )}
            >
              <div className="text-sm text-foreground/90 line-clamp-2 mb-1">
                {x.title ?? 'Untitled'}
              </div>
              
              <div className="mt-1 text-[11px] text-foreground/60 flex items-center gap-2 flex-wrap">
                <span className="rounded-full bg-background/5 ring-1 ring-accent/30 px-2 py-[2px] text-accent">
                  Soft link
                </span>
                
                {x.post_type && (
                  <span className="rounded-full bg-background/5 ring-1 ring-foreground/10 px-2 py-[2px]">
                    {x.post_type}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </GlassCard>
  );
}
