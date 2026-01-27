/**
 * Pillar #1: Individual Workspace as Default Entry
 * 
 * For authenticated users, the workspace replaces feeds.
 * This is a private cognitive sanctuary, not a content feed.
 */

import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { NewLanding } from './NewLanding';
import { WorkspaceCanvas } from '@/features/workspace';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Safety timeout for loading state (in case auth gets stuck)
const LOADING_TIMEOUT_MS = 8000;

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  // Safety timeout - if loading takes too long, show landing page
  useEffect(() => {
    if (!loading) {
      setLoadingTimedOut(false);
      return;
    }
    
    const timeoutId = window.setTimeout(() => {
      console.warn('Index page: Auth loading timed out, showing landing page');
      setLoadingTimedOut(true);
    }, LOADING_TIMEOUT_MS);
    
    return () => window.clearTimeout(timeoutId);
  }, [loading]);

  // Redirect to profile only after signup, not regular login
  useEffect(() => {
    if (user && window.location.search.includes('type=signup')) {
      navigate('/profile');
      return;
    }
  }, [user, navigate]);

  // If loading timed out, treat as unauthenticated
  if (loading && !loadingTimedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  // Unauthenticated (or loading timed out): show landing page
  if (!user) {
    return <NewLanding />;
  }

  // Authenticated: show Individual Workspace (Pillar #1)
  // Bypasses AppMode entirely - workspace is the default experience
  return (
    <ProtectedRoute requireAuth={true}>
      <WorkspaceCanvas />
    </ProtectedRoute>
  );
};

export default Index;
