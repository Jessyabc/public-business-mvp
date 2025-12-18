/**
 * Pillar #1: Individual Workspace as Default Entry
 * 
 * For authenticated users, the workspace replaces feeds.
 * This is a private cognitive sanctuary, not a content feed.
 */

import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Landing } from './Landing';
import { WorkspaceCanvas } from '@/features/workspace';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const Index = () => {
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  // Unauthenticated: show landing page
  if (!user) {
    return <Landing />;
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
