import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Define interface based on actual database schema
export interface BusinessInvitation {
  id: string;
  invitee_email: string;
  inviter_id: string;
  token: string;
  role: string;
  consumed_at: string | null;
  expires_at: string;
  created_at: string;
}

export interface CreateInvitationData {
  invitee_email: string;
}

function computeStatus(inv: BusinessInvitation): 'pending' | 'used' | 'expired' {
  const now = Date.now();
  const exp = new Date(inv.expires_at).getTime();
  if (inv.consumed_at) return 'used';
  if (exp <= now) return 'expired';
  return 'pending';
}

export function useBusinessInvitations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState<BusinessInvitation[]>([]);
  const [receivedInvitations, setReceivedInvitations] = useState<BusinessInvitation[]>([]);

  const fetchSentInvitations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Use type assertion to bypass type checking
      const { data, error } = await (supabase as any)
        .from('business_invitations')
        .select('id, invitee_email, inviter_id, token, role, consumed_at, expires_at, created_at')
        .eq('inviter_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data as BusinessInvitation[] || []);
    } catch (error: unknown) {
      console.error('Error fetching sent invitations:', error);
      let description = 'Failed to fetch sent invitations';
      if (error instanceof Error) {
        description = error.message;
      } else if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        description = (error as { message: string }).message;
      }
      toast({
        title: 'Error',
        description,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const fetchReceivedInvitations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email;
      if (!email) return;

      // Use type assertion to bypass type checking
      const { data, error } = await (supabase as any)
        .from('business_invitations')
        .select('id, invitee_email, inviter_id, token, role, consumed_at, expires_at, created_at')
        .eq('invitee_email', email.toLowerCase())
        .is('consumed_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReceivedInvitations(data as BusinessInvitation[] || []);
    } catch (error: unknown) {
      console.error('Error fetching received invitations:', error);
      let description = 'Failed to fetch received invitations';
      if (error instanceof Error) {
        description = error.message;
      } else if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        description = (error as { message: string }).message;
      }
      toast({
        title: 'Error',
        description,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // CREATE via RPC (server-side token + RLS)
  const createInvitation = useCallback(async (input: CreateInvitationData) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to send invitations',
        variant: 'destructive',
      });
      return null;
    }
    setLoading(true);
    try {
      const { rpcCreateBusinessInvite } = await import('@/integrations/supabase/rpc');
      const { data, error } = await rpcCreateBusinessInvite(input.invitee_email);
      if (error) throw error;

      // Re-fetch to include the fresh row created by RPC
      await fetchSentInvitations();

      const row = (data ?? [])[0];
      if (row) {
        toast({
          title: 'Invite created',
          description: `Link ready. Expires ${new Date(row.expires_at).toLocaleDateString()}`,
        });
      }

      return row; // { token, expires_at }
    } catch (error: unknown) {
      console.error('Error creating invitation:', error);
      let description = 'Failed to send invitation';
      if (error instanceof Error) {
        description = error.message;
      } else if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        description = (error as { message: string }).message;
      }
      toast({
        title: 'Error',
        description,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, toast, fetchSentInvitations]);

  // ACCEPT via RPC (needs the token)
  const acceptInvitation = useCallback(async (token: string) => {
    if (!user) return false;
    setLoading(true);
    try {
      const { rpcConsumeInvite } = await import('@/integrations/supabase/rpc');
      const { error } = await rpcConsumeInvite(token);
      if (error) throw error;

      toast({
        title: 'Welcome!',
        description: 'Business Member access granted.',
      });

      // Remove from received + refresh sent
      setReceivedInvitations(prev => prev.filter(inv => inv.token !== token));
      await fetchSentInvitations();
      return true;
    } catch (error: unknown) {
      console.error('Error accepting invitation:', error);
      let description = 'Failed to accept invitation';
      if (error instanceof Error) {
        description = error.message;
      } else if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        description = (error as { message: string }).message;
      }
      toast({
        title: 'Error',
        description,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast, fetchSentInvitations]);

  // REJECT by marking consumed (allowed by RLS policy "Invitee can mark consumed")
  const rejectInvitation = useCallback(async (id: string) => {
    if (!user) return false;
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email?.toLowerCase();
      if (!email) throw new Error('No email');

      // Update the invite row where the invitee is the current user
      const { error } = await (supabase as any)
        .from('business_invitations')
        .update({ consumed_at: new Date().toISOString() })
        .eq('id', id)
        .eq('invitee_email', email) // belt-and-suspenders; RLS also checks this
        .is('consumed_at', null);

      if (error) throw error;

      setReceivedInvitations(prev => prev.filter(inv => inv.id !== id));
      toast({
        title: 'Invitation declined',
        description: 'The invitation was closed.',
      });
      return true;
    } catch (error: unknown) {
      console.error('Error rejecting invitation:', error);
      let description = 'Failed to reject invitation';
      if (error instanceof Error) {
        description = error.message;
      } else if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        description = (error as { message: string }).message;
      }
      toast({
        title: 'Error',
        description,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Token processing now only occurs on /accept-invite page

  // Expose a convenience status helper if you want it in the UI
  const getInvitationStatus = useCallback(
    (inv: BusinessInvitation) => computeStatus(inv),
    [],
  );

  useEffect(() => {
    if (user) {
      fetchSentInvitations();
      fetchReceivedInvitations();
    }
  }, [user, fetchSentInvitations, fetchReceivedInvitations]);

  return {
    invitations,
    receivedInvitations,
    loading,
    createInvitation,
    acceptInvitation,
    rejectInvitation,
    fetchSentInvitations,
    fetchReceivedInvitations,
    refetch: () => {
      fetchSentInvitations();
      fetchReceivedInvitations();
    },
    getInvitationStatus,
  };
}