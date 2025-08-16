import { useAppMode } from '@/contexts/AppModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Landing } from './Landing';
import { PublicFeed } from "@/components/feeds/PublicFeed";
import { BusinessFeed } from "@/components/feeds/BusinessFeed";
import { Button } from '@/components/ui/button';

const Index = () => {
  const { mode } = useAppMode();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to profile after login/signup
  useEffect(() => {
    if (user && window.location.search.includes('type=signup')) {
      navigate('/profile');
      return;
    }
  }, [user, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">Loading...</div>
    </div>;
  }

  if (!user) {
    return <Landing />;
  }

  // If user is connected, show the feeds with a button to access profile
  const feedContent = mode === 'business' ? <BusinessFeed /> : <PublicFeed />;
  
  return (
    <div className="relative">
      {/* Return to Profile Button */}
      <div className="fixed top-20 right-6 z-40">
        <Button
          onClick={() => navigate('/profile')}
          variant="outline"
          className={`backdrop-blur-xl transition-all duration-300 shadow-lg hover:scale-105 ${
            mode === 'public'
              ? 'bg-black/20 border-white/20 text-white hover:bg-white/10'
              : 'bg-white/40 border-blue-200/30 text-slate-600 hover:bg-white/60'
          }`}
        >
          Back to Profile
        </Button>
      </div>
      {feedContent}
    </div>
  );
};

export default Index;
