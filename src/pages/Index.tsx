import { useAppMode } from '@/contexts/AppModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Landing } from './Landing';
import BrainstormFeed from '@/pages/brainstorm/BrainstormFeed';
import { BusinessFeed } from "@/components/feeds/BusinessFeed";
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const Index = () => {
  const { mode, setMode } = useAppMode();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checkingBusiness, setCheckingBusiness] = useState(true);

  // Check business membership and redirect if applicable
  useEffect(() => {
    if (!user) {
      setCheckingBusiness(false);
      return;
    }

    async function checkBusinessMembership() {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_business_member, business_profile_id')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking business membership:', error);
          setCheckingBusiness(false);
          return;
        }

        // Business Mode Unlock: redirect to dashboard if business member
        if (profile?.is_business_member && profile?.business_profile_id) {
          setMode('business');
          navigate('/business/dashboard', { replace: true });
          return;
        }

        // Public Mode (default)
        if (!profile?.is_business_member) {
          setMode('public');
        }
      } catch (error) {
        console.error('Error in business membership check:', error);
      } finally {
        setCheckingBusiness(false);
      }
    }

    checkBusinessMembership();
  }, [user, navigate, setMode]);

  // Redirect to profile only after signup, not regular login
  useEffect(() => {
    if (user && window.location.search.includes('type=signup')) {
      navigate('/profile');
      return;
    }
  }, [user, navigate]);

  if (loading || checkingBusiness) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">Loading...</div>
    </div>;
  }

  if (!user) {
    return <Landing />;
  }

  // If user is connected, show the feeds
  const feedContent = mode === 'business' ? <BusinessFeed /> : <BrainstormFeed />;
  
  return (
    <ProtectedRoute requireAuth={true}>
      {feedContent}
    </ProtectedRoute>
  );
};

export default Index;
