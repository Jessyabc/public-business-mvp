import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface BusinessInvitation {
  id: string;
  invited_email: string;
  invited_by_user_id: string;
  invited_by_type: 'business_member' | 'business';
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInvitationData {
  invited_email: string;
  invited_by_type: 'business_member' | 'business';
}

export function useBusinessInvitations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState<BusinessInvitation[]>([]);
  const [receivedInvitations, setReceivedInvitations] = useState<BusinessInvitation[]>([]);

  const fetchSentInvitations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_invitations')
        .select('*')
        .eq('invited_by_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations((data as BusinessInvitation[]) || []);
    } catch (error: any) {
      console.error('Error fetching sent invitations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sent invitations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReceivedInvitations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.email) return;

      const { data, error } = await supabase
        .from('business_invitations')
        .select('*')
        .eq('invited_email', userData.user.email)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReceivedInvitations((data as BusinessInvitation[]) || []);
    } catch (error: any) {
      console.error('Error fetching received invitations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch received invitations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createInvitation = async (invitationData: CreateInvitationData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to send invitations",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_invitations')
        .insert({
          invited_email: invitationData.invited_email,
          invited_by_user_id: user.id,
          invited_by_type: invitationData.invited_by_type,
        })
        .select()
        .single();

      if (error) throw error;
      
      setInvitations(prev => [data as BusinessInvitation, ...prev]);
      
      toast({
        title: "Success",
        description: "Business invitation sent successfully",
      });
      
      return data;
    } catch (error: any) {
      console.error('Error creating invitation:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async (invitationId: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('accept_business_invitation', {
        invitation_id: invitationId
      });

      if (error) throw error;
      
      if (data) {
        // Remove from received invitations
        setReceivedInvitations(prev => 
          prev.filter(inv => inv.id !== invitationId)
        );
        
        toast({
          title: "Success",
          description: "Welcome to the business community! You are now a Business member.",
        });
        
        return true;
      } else {
        toast({
          title: "Error",
          description: "Invalid or expired invitation",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: "Failed to accept invitation",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const rejectInvitation = async (invitationId: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('business_invitations')
        .update({ status: 'rejected' })
        .eq('id', invitationId);

      if (error) throw error;
      
      // Remove from received invitations
      setReceivedInvitations(prev => 
        prev.filter(inv => inv.id !== invitationId)
      );
      
      toast({
        title: "Invitation Rejected",
        description: "You have rejected the business invitation",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error rejecting invitation:', error);
      toast({
        title: "Error",
        description: "Failed to reject invitation",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const consumeInvitationToken = async (token: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await (supabase as any).rpc('consume_invite', { p_token: token });
      if (error) {
        console.error('Token consumption error:', error);
        toast({
          title: "Error",
          description: error.message || "Invalid or expired invite",
          variant: "destructive",
        });
        return false;
      } else {
        toast({
          title: "Success",
          description: "You're in! Business Member access granted.",
        });
        
        // Remove token from URL
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        window.history.replaceState({}, document.title, url.pathname + url.search);
        
        // Refresh invitations to update UI
        await fetchReceivedInvitations();
        return true;
      }
    } catch (error: any) {
      console.error('Error consuming invitation token:', error);
      toast({
        title: "Error",
        description: "Failed to process invitation",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSentInvitations();
      fetchReceivedInvitations();
    }
  }, [user]);

  return {
    invitations,
    receivedInvitations,
    loading,
    createInvitation,
    acceptInvitation,
    rejectInvitation,
    consumeInvitationToken,
    fetchSentInvitations,
    fetchReceivedInvitations,
    refetch: () => {
      fetchSentInvitations();
      fetchReceivedInvitations();
    },
  };
}