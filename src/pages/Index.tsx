import { useAppMode } from '@/contexts/AppModeContext';
import FlowView from "@/components/FlowView";
import { PublicFeed } from "@/components/feeds/PublicFeed";
import { BusinessFeed } from "@/components/feeds/BusinessFeed";

const Index = () => {
  const { mode } = useAppMode();

  if (mode === 'business') {
    return <BusinessFeed />;
  }

  return <PublicFeed />;
};

export default Index;
