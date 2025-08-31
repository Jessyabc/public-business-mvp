import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    // Get initial session with error handling
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Auth session error:', error);
      }
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Get user type from metadata
        setUserType(session.user.user_metadata?.user_type || 'public');
        
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
      }
      setLoading(false);
    }).catch((error) => {
      console.error('Auth initialization error:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setUserType(session.user.user_metadata?.user_type || 'public');
          
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
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

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