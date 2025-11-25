import { useState, useEffect } from 'react';
import { FeedContainer } from '@/features/feed/FeedContainer';
import { BrainstormLayoutShell } from '@/features/brainstorm/components/BrainstormLayoutShell';
import { CrossLinksFeed } from '@/features/brainstorm/components/CrossLinksFeed';
import { ComposerModal } from '@/components/composer/ComposerModal';
import { PostLineageOverlay } from '@/components/brainstorm/PostLineageOverlay';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { useBrainstormExperienceStore } from '@/features/brainstorm/stores/experience';

export default function BrainstormFeed() {
  const activePostId = useBrainstormExperienceStore(state => state.activePostId);
  const [composerOpen, setComposerOpen] = useState(false);
  const [lineagePostId, setLineagePostId] = useState<string | null>(null);
  const [activePostForLineage, setActivePostForLineage] = useState<BasePost | null>(null);

  // Listen for continue and lineage events
  useEffect(() => {
    const handleContinue = (e: Event) => {
      const customEvent = e as CustomEvent;
      const parentId = customEvent.detail?.parentId;
      if (parentId) {
        setComposerOpen(true);
      }
    };
    const handleShowLineage = (e: Event) => {
      const customEvent = e as CustomEvent;
      const postId = customEvent.detail?.postId;
      if (postId) {
        setLineagePostId(postId);
      }
    };
    window.addEventListener('pb:brainstorm:continue', handleContinue);
    window.addEventListener('pb:brainstorm:show-lineage', handleShowLineage);
    return () => {
      window.removeEventListener('pb:brainstorm:continue', handleContinue);
      window.removeEventListener('pb:brainstorm:show-lineage', handleShowLineage);
    };
  }, []);

  // Sync overlay with activePostId when it changes (e.g., from clicking a continuation)
  useEffect(() => {
    if (activePostId && lineagePostId !== activePostId) {
      // Only update if overlay is already open (to avoid opening on initial load)
      if (lineagePostId !== null) {
        setLineagePostId(activePostId);
      }
    }
  }, [activePostId, lineagePostId]);

  const handleCloseOverlay = () => {
    setLineagePostId(null);
  };

  return (
    <>
      <BrainstormLayoutShell
        main={<FeedContainer mode="brainstorm_main" activePostId={activePostId} />}
        crossLinks={<CrossLinksFeed postId={activePostId} />}
        sidebar={<RightSidebar variant="feed" />}
      />
      <ComposerModal isOpen={composerOpen} onClose={() => setComposerOpen(false)} />
      <PostLineageOverlay postId={lineagePostId} onClose={handleCloseOverlay} />
    </>
  );
}