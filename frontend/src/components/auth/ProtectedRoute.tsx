import { ReactNode, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, LogIn } from 'lucide-react';

// Safety timeout for loading state
const LOADING_TIMEOUT_MS = 12000;

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  // Safety timeout for loading
  useEffect(() => {
    if (!loading) {
      setLoadingTimedOut(false);
      return;
    }
    
    const timeoutId = window.setTimeout(() => {
      console.warn('ProtectedRoute: Auth loading timed out');
      setLoadingTimedOut(true);
    }, LOADING_TIMEOUT_MS);
    
    return () => window.clearTimeout(timeoutId);
  }, [loading]);

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      // Don't redirect, just show login prompt
    }
  }, [user, loading, requireAuth]);

  // Only show loading if we haven't timed out
  if (loading && !loadingTimedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <div className="text-blue-200">Loading...</div>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center glass-card p-8 max-w-md">
          <Lock className="w-12 h-12 mx-auto mb-4 text-blue-400" />
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-blue-200 mb-6">
            You need to be logged in to access this page. Please sign in to continue.
          </p>
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}