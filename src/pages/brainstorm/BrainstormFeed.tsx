import { FeedContainer } from '@/features/feed/FeedContainer';
import { BrainstormLayoutShell } from '@/features/brainstorm/components/BrainstormLayoutShell';
import { useBrainstormExperienceStore } from '@/features/brainstorm/stores/experience';

export default function BrainstormFeed() {
  const activePostId = useBrainstormExperienceStore((state) => state.activePostId);

  return (
    <BrainstormLayoutShell
      lastSeen={<FeedContainer mode="brainstorm_last_seen" />}
      main={<FeedContainer mode="brainstorm_main" activePostId={activePostId} />}
      sidebar={<div className="text-muted-foreground">Sidebar placeholder</div>}
    />
  );
}
