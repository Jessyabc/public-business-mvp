import { useAppMode } from '@/contexts/AppModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Landing } from './Landing';
import { BrainstormFeed } from "@/components/feeds/BrainstormFeed";
import { BusinessFeed } from "@/components/feeds/BusinessFeed";
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const Index = () => {
  const { mode } = useAppMode();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to profile only after signup, not regular login
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
    return (
      <MainLayout>
        <Landing />
      </MainLayout>
    );
  }

  // If user is connected, show the feeds
  const feedContent = mode === 'business' ? <BusinessFeed /> : <BrainstormFeed />;
  
  return (
    <ProtectedRoute requireAuth={true}>
      <div className="relative">
        {feedContent}
      </div>
    </ProtectedRoute>
  );
};

export default Index;
