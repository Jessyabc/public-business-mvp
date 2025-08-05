import { useAppMode } from '@/contexts/AppModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Landing } from './Landing';
import { PublicFeed } from "@/components/feeds/PublicFeed";
import { BusinessFeed } from "@/components/feeds/BusinessFeed";
import { ProfileForm } from "@/components/profile/ProfileForm"; // ✅ Import your form

const Index = () => {
  const { mode } = useAppMode();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  // ✅ After login, go to the profile form
  return <ProfileForm />;

  // Later, once profile.is_completed is true, go to the feed:
  // if (profile?.is_completed) {
  //   return mode === 'business' ? <BusinessFeed /> : <PublicFeed />;
  // } else {
  //   return <ProfileForm />;
  // }
};

export default Index;
