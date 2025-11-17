import { useEffect, useState } from 'react';
import { GlobalBackground } from '@/components/layout/GlobalBackground';
import { GlowDefs } from '@/components/graphics/GlowDefs';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { FeedContainer } from '@/features/feed/FeedContainer';
import { NodeForm } from '@/features/brainstorm/components/NodeForm';
import { LinkPicker } from '@/features/brainstorm/components/LinkPicker';
import { BrainstormFeedRenderer } from '@/features/brainstorm/components/BrainstormFeedRenderer';
import { BrainstormLayoutShell } from '@/features/brainstorm/components/BrainstormLayoutShell';
import { LastSeenFeed } from '@/features/brainstorm/components/LastSeenFeed';
import { CrossLinksFeed } from '@/features/brainstorm/components/CrossLinksFeed';

/**
 * BrainstormFeed stitches together the 3-column Brainstorm layout:
 * - Left: last seen history
 * - Center: canonical FeedContainer + canvas
 * - Right: cross-links and sidebar tabs
 */
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
    <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <GlobalBackground />
      <GlowDefs />

      <BrainstormLayoutShell
        leftColumn={
          <div className="flex h-full flex-col gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-primary/70">History</p>
              <h3 className="text-lg font-semibold text-white">Last seen</h3>
            </div>
            <LastSeenFeed />
          </div>
        }
        centerColumn={
          <FeedContainer
            mode="brainstorm_main"
            initialKinds={['brainstorm','spark','business_insight']}
            renderFeed={(items, feed) => (
              <BrainstormFeedRenderer items={items} loading={feed.loading} onRefresh={feed.refresh} />
            )}
          />
        }
        rightColumn={
          <div className="flex h-full flex-col gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
              <div className="mb-3">
                <p className="text-xs uppercase tracking-wide text-primary/70">Network</p>
                <h3 className="text-lg font-semibold text-white">Cross-links</h3>
              </div>
              <CrossLinksFeed />
            </div>
            <RightSidebar variant="feed" />
          </div>
        }
      />

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
