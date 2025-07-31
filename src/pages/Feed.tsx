import { useAppMode } from '@/contexts/AppModeContext';
import { PublicFeed } from "@/components/feeds/PublicFeed";
import { BusinessFeed } from "@/components/feeds/BusinessFeed";

const Feed = () => {
  const { mode } = useAppMode();

  if (mode === 'business') {
    return <BusinessFeed />;
  }

  return <PublicFeed />;
};

export default Feed;