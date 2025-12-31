import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface OrgRequest {
  id: string;
  user_id: string;
  org_name: string;
  org_description: string | null;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useOrgRequests() {
  const { user } = useAuth();
  const [myRequest, setMyRequest] = useState<OrgRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMyRequest = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('org_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setMyRequest(data as OrgRequest | null);
    } catch (err) {
      console.error('Error fetching org request:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyRequest();
  }, [fetchMyRequest]);

  const submitRequest = async (data: { org_name: string; org_description?: string; reason?: string }) => {
    if (!user) {
      toast.error('You must be logged in to submit a request');
      return;
    }

    try {
      const { data: newRequest, error } = await supabase
        .from('org_requests')
        .insert({
          user_id: user.id,
          org_name: data.org_name,
          org_description: data.org_description || null,
          reason: data.reason || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      setMyRequest(newRequest as OrgRequest);
      toast.success('Organization request submitted! We will review it shortly.');
    } catch (err: any) {
      console.error('Error submitting org request:', err);
      toast.error(err.message || 'Failed to submit request');
      throw err;
    }
  };

  const updateRequest = async (data: { org_name: string; org_description?: string; reason?: string }) => {
    if (!user || !myRequest) {
      toast.error('No request to update');
      return;
    }

    try {
      const { data: updatedRequest, error } = await supabase
        .from('org_requests')
        .update({
          org_name: data.org_name,
          org_description: data.org_description || null,
          reason: data.reason || null,
          status: 'pending', // Reset to pending when resubmitting
          updated_at: new Date().toISOString(),
        })
        .eq('id', myRequest.id)
        .select()
        .single();

      if (error) throw error;
      setMyRequest(updatedRequest as OrgRequest);
      toast.success('Request updated and resubmitted!');
    } catch (err: any) {
      console.error('Error updating org request:', err);
      toast.error(err.message || 'Failed to update request');
      throw err;
    }
  };

  return {
    myRequest,
    loading,
    submitRequest,
    updateRequest,
    refetch: fetchMyRequest,
  };
}

// Admin hook for managing all org requests
export function useAdminOrgRequests() {
  const [requests, setRequests] = useState<OrgRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('org_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setRequests((data || []) as OrgRequest[]);
    } catch (err) {
      console.error('Error fetching org requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const approveRequest = async (requestId: string) => {
    try {
      // Get the request details first
      const { data: request, error: fetchError } = await supabase
        .from('org_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError) throw fetchError;

      // Create the org using the RPC function
      const { data: orgId, error: createError } = await (supabase.rpc as any)('create_org_and_owner', {
        p_name: request.org_name,
        p_description: request.org_description,
      });

      if (createError) throw createError;

      // If the user is not the current user, we need to transfer ownership
      // For now, we'll add them as a member if they're different
      const { data: currentUser } = await supabase.auth.getUser();
      if (currentUser?.user?.id !== request.user_id) {
        // Add the requesting user as business_admin to the org
        await supabase.from('org_members').insert({
          org_id: orgId,
          user_id: request.user_id,
          role: 'business_admin',
        });
      }

      // Update the request status
      const { error: updateError } = await supabase
        .from('org_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: currentUser?.user?.id || null,
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      toast.success('Organization created and request approved!');
      fetchPendingRequests();
    } catch (err: any) {
      console.error('Error approving org request:', err);
      toast.error(err.message || 'Failed to approve request');
    }
  };

  const rejectRequest = async (requestId: string, reason?: string) => {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('org_requests')
        .update({
          status: 'rejected',
          reason: reason || 'Request rejected by admin',
          reviewed_at: new Date().toISOString(),
          reviewed_by: currentUser?.user?.id || null,
        })
        .eq('id', requestId);

      if (error) throw error;
      toast.success('Request rejected');
      fetchPendingRequests();
    } catch (err: any) {
      console.error('Error rejecting org request:', err);
      toast.error(err.message || 'Failed to reject request');
    }
  };

  return {
    requests,
    loading,
    approveRequest,
    rejectRequest,
    refetch: fetchPendingRequests,
  };
}
