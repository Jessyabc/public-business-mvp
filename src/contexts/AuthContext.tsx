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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
        
        // Check for invitation token in URL after user is authenticated
        setTimeout(() => {
          const token = new URLSearchParams(window.location.search).get('token');
          if (token) {
            consumeInvitationToken(token);
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
          
          // Check for invitation token in URL when user signs in
          setTimeout(() => {
            const token = new URLSearchParams(window.location.search).get('token');
            if (token) {
              consumeInvitationToken(token);
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

  const consumeInvitationToken = async (token: string) => {
    try {
      const { error } = await (supabase as any).rpc('consume_invite', { p_token: token });
      if (error) {
        console.error('Token consumption error:', error);
        // Show friendly error message - could add toast here if imported
      } else {
        // Success: they're now a Business Member
        console.log("Business Member access granted via token");
        // Remove token from URL
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        window.history.replaceState({}, document.title, url.pathname + url.search);
        // Could add success toast here if imported
      }
    } catch (error) {
      console.error('Error consuming invitation token:', error);
    }
  };

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