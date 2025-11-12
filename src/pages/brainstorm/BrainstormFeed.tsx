import { useEffect, useState } from 'react';
import { GlobalBackground } from '@/components/layout/GlobalBackground';
import { FeedContainer } from '@/features/feed/FeedContainer';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { GlowDefs } from '@/components/graphics/GlowDefs';
import { RefreshCcw } from 'lucide-react';
import { NodeForm } from '@/features/brainstorm/components/NodeForm';
import { LinkPicker } from '@/features/brainstorm/components/LinkPicker';
import { BrainstormCanvasShell } from '@/features/brainstorm/BrainstormCanvasShell';
import { convertFeedPostToUniversal } from '@/features/brainstorm/utils/postConverter';

export default function BrainstormFeed() {
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState<'root' | 'continue'>('root');
  const [composerParentId, setComposerParentId] = useState<string | null>(null);
  const [linkPickerOpen, setLinkPickerOpen] = useState(false);
  const [linkSourceId, setLinkSourceId] = useState<string | null>(null);

  // Listen for Continue and Link events (for future use)
  useEffect(() => {
    const handleContinue = (e: any) => {
      const parentId = e.detail.parentId;
      setComposerMode('continue');
      setComposerParentId(parentId);
      setComposerOpen(true);
    };

    const handleLink = (e: any) => {
      const sourceId = e.detail.sourceId;
      setLinkSourceId(sourceId);
      setLinkPickerOpen(true);
    };

    window.addEventListener('pb:brainstorm:continue', handleContinue);
    window.addEventListener('pb:brainstorm:link', handleLink);

    return () => {
      window.removeEventListener('pb:brainstorm:continue', handleContinue);
      window.removeEventListener('pb:brainstorm:link', handleLink);
    };
  }, []);

  return (
    <main className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <GlobalBackground />
      <GlowDefs />

      {/* Refresh - reserved for future use */}
      <div className="absolute z-20 left-4 top-3 flex items-center gap-2">
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10"
        >
          <RefreshCcw size={16}/> Refresh
        </button>
      </div>

      <div className="grid grid-cols-[70%_30%] gap-0 h-screen">
        <section className="relative overflow-hidden p-4 md:p-6">
          <FeedContainer 
            mode="public" 
            initialKinds={['brainstorm']}
            renderFeed={(items, feed) => {
              // Convert feed posts to Universal Post Model format
              const universalPosts = items.map(convertFeedPostToUniversal);
              
              return (
                <div className="h-full">
                  <BrainstormCanvasShell posts={universalPosts} className="h-full" />
                  {feed.loading && (
                    <div className="text-center py-4 text-muted-foreground">
                      Loading more posts...
                    </div>
                  )}
                </div>
              );
            }}
          />
        </section>
        <aside className="border-l border-border/50 bg-background/50 backdrop-blur-sm overflow-hidden">
          <RightSidebar variant="feed" />
        </aside>
      </div>

      {/* NodeForm Modal */}
      <NodeForm
        open={composerOpen}
        onOpenChange={(open) => {
          setComposerOpen(open);
          if (!open) {
            setComposerParentId(null);
          }
        }}
        mode={composerMode}
        parentId={composerParentId}
      />

      {/* LinkPicker Modal */}
      <LinkPicker
        open={linkPickerOpen}
        onOpenChange={(open) => {
          setLinkPickerOpen(open);
          if (!open) {
            setLinkSourceId(null);
          }
        }}
        sourceId={linkSourceId}
      />
    </main>
  );
}
