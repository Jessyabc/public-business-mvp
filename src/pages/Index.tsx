import { useAppMode } from '@/contexts/AppModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Landing } from './Landing';
import { PublicFeed } from "@/components/feeds/PublicFeed";
import { BusinessFeed } from "@/components/feeds/BusinessFeed";

const Index = () => {
  const { mode } = useAppMode();
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">Loading...</div>
    </div>;
  }

  if (!profile) {
  return <div className="text-center p-6">No profile data.</div>;
  }

  
  if (!user) {
    return <Landing />;
  }

  if (mode === 'business') {
    return <BusinessFeed />;
  }

  return <PublicFeed />;
};

export default Index;
