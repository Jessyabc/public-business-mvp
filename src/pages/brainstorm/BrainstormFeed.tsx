import { useState, useEffect } from 'react';
import { FeedContainer } from '@/features/feed/FeedContainer';
import { BrainstormLayoutShell } from '@/features/brainstorm/components/BrainstormLayoutShell';
import { CrossLinksFeed } from '@/features/brainstorm/components/CrossLinksFeed';
import { ComposerModal } from '@/components/composer/ComposerModal';

import { useBrainstormExperienceStore } from '@/features/brainstorm/stores/experience';

export default function BrainstormFeed() {
  const activePostId = useBrainstormExperienceStore((state) => state.activePostId);
  const [composerOpen, setComposerOpen] = useState(false);

  // Listen for continue event from BrainstormPostCard
  useEffect(() => {
    const handleContinue = (e: Event) => {
      const customEvent = e as CustomEvent;
      const parentId = customEvent.detail?.parentId;
      if (parentId) {
        // For now, just open composer - later we can set parent context
        setComposerOpen(true);
      }
    };

    window.addEventListener('pb:brainstorm:continue', handleContinue);

    return () => {
      window.removeEventListener('pb:brainstorm:continue', handleContinue);
    };
  }, []);

  return (
    <>
      <BrainstormLayoutShell
        lastSeen={<FeedContainer mode="brainstorm_last_seen" />}
        main={<FeedContainer mode="brainstorm_main" activePostId={activePostId} />}
        crossLinks={<CrossLinksFeed postId={activePostId} />}
        sidebar={<div className="text-muted-foreground p-4">Right Sidebar (Breadcrumbs / Open Ideas)</div>}
      />
      <ComposerModal isOpen={composerOpen} onClose={() => setComposerOpen(false)} />
    </>
  );
}
