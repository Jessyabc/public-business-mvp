import * as React from 'react';
const { createContext, useContext, useEffect, useState } = React;
type ReactNode = React.ReactNode;
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userType: 'public' | 'business') => Promise<{ error?: AuthError }>;
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<void>;
  userType: 'public' | 'business' | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'public' | 'business' | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    let isMounted = true;
    let hasFinished = false;
    
    const loadingTimeoutId = window.setTimeout(() => {
      if (hasFinished) return;
      console.warn('Auth initialization timed out. Falling back to unauth state.');
      hasFinished = true;
      // Always set loading to false on timeout, regardless of mount state
      // React will ignore updates to unmounted components safely
      setLoading(false);
    }, 5000);

    const finishLoading = () => {
      if (hasFinished) return;
      hasFinished = true;
      window.clearTimeout(loadingTimeoutId);
      // Only update state if still mounted
      if (isMounted) {
        setLoading(false);
      }
    };

    // Get initial session with error handling
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Auth session error:', error);
      }
      if (!isMounted) {
        finishLoading();
        return;
      }
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Get user type from metadata
        setUserType(session.user.user_metadata?.user_type || 'public');
        
        // Invalidate org membership queries to ensure fresh data
        queryClient.invalidateQueries({ queryKey: ['org_membership'] });
        
        // After user signs in, if we stored an invite token before sign-in, consume it here once.
        setTimeout(async () => {
          const pending = sessionStorage.getItem("pending_invite_token");
          if (pending) {
            sessionStorage.removeItem("pending_invite_token");
            try {
              const { rpcConsumeInvite } = await import("@/integrations/supabase/rpc");
              const { error } = await rpcConsumeInvite(pending);
              if (!error) {
                console.log("Invite consumed post-login");
              }
            } catch { /* no-op; UI toasts handled on /accept-invite page */ }
          }
        }, 0);
      } else {
        // User logged out - clear org membership queries
        queryClient.invalidateQueries({ queryKey: ['org_membership'] });
      }
      finishLoading();
    }).catch((error) => {
      console.error('Auth initialization error:', error);
      finishLoading();
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setUserType(session.user.user_metadata?.user_type || 'public');
          
          // Invalidate org membership queries when user logs in
          queryClient.invalidateQueries({ queryKey: ['org_membership'] });
          
          // Check for pending token after sign-in
          setTimeout(async () => {
            const pending = sessionStorage.getItem("pending_invite_token");
            if (pending) {
              sessionStorage.removeItem("pending_invite_token");
              try {
                const { rpcConsumeInvite } = await import("@/integrations/supabase/rpc");
                const { error } = await rpcConsumeInvite(pending);
                if (!error) {
                  console.log("Invite consumed post-login");
                }
              } catch { /* no-op; UI toasts handled on /accept-invite page */ }
            }
          }, 0);
        } else {
          setUserType(null);
          // User logged out - clear org membership queries
          queryClient.invalidateQueries({ queryKey: ['org_membership'] });
        }
        finishLoading();
      }
    );

    return () => {
      isMounted = false;
      window.clearTimeout(loadingTimeoutId);
      subscription.unsubscribe();
    };
  }, [queryClient]);

  // Remove consumeInvitationToken - now handled by AcceptInvite page

  const signUp = async (email: string, password: string, userType: 'public' | 'business') => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { error: { message: 'Please enter a valid email address' } as AuthError };
    }

    // Validate password length
    if (password.length < 8) {
      return { error: { message: 'Password must be at least 8 characters long' } as AuthError };
    }

    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          user_type: userType,
        },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    userType,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}