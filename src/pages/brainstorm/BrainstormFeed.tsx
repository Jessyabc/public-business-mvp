import { useState, useEffect } from 'react';
import { FeedContainer } from '@/features/feed/FeedContainer';
import { BrainstormLayoutShell } from '@/features/brainstorm/components/BrainstormLayoutShell';
import { CrossLinksFeed } from '@/features/brainstorm/components/CrossLinksFeed';
import { ComposerModal } from '@/components/composer/ComposerModal';
import { LinkPicker } from '@/features/brainstorm/components/LinkPicker';
import { useBrainstormExperienceStore } from '@/features/brainstorm/stores/experience';

export default function BrainstormFeed() {
  const activePostId = useBrainstormExperienceStore((state) => state.activePostId);
  const [composerOpen, setComposerOpen] = useState(false);
  const [linkPickerOpen, setLinkPickerOpen] = useState(false);
  const [linkSourceId, setLinkSourceId] = useState<string | null>(null);

  // Listen for continue/link events from BrainstormPostCard
  useEffect(() => {
    const handleContinue = (e: Event) => {
      const customEvent = e as CustomEvent;
      const parentId = customEvent.detail?.parentId;
      if (parentId) {
        // For now, just open composer - later we can set parent context
        setComposerOpen(true);
      }
    };

    const handleLink = (e: Event) => {
      const customEvent = e as CustomEvent;
      const sourceId = customEvent.detail?.sourceId;
      if (sourceId) {
        setLinkSourceId(sourceId);
        setLinkPickerOpen(true);
      }
    };

    window.addEventListener('pb:brainstorm:continue', handleContinue);
    window.addEventListener('pb:brainstorm:link', handleLink);

    return () => {
      window.removeEventListener('pb:brainstorm:continue', handleContinue);
      window.removeEventListener('pb:brainstorm:link', handleLink);
    };
  }, []);

  return (
    <>
      <BrainstormLayoutShell
        lastSeen={<FeedContainer mode="brainstorm_last_seen" />}
        main={<FeedContainer mode="brainstorm_main" activePostId={activePostId} />}
        sidebar={<CrossLinksFeed postId={activePostId} />}
      />
      <ComposerModal isOpen={composerOpen} onClose={() => setComposerOpen(false)} />
      <LinkPicker
        open={linkPickerOpen}
        onOpenChange={setLinkPickerOpen}
        sourceId={linkSourceId}
      />
    </>
  );
}
