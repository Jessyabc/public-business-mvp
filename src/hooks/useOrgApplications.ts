import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { rpcApplyToOrg, rpcApproveOrgMemberApplication, rpcRejectOrgMemberApplication } from '@/integrations/supabase/rpc';

export interface OrgMemberApplication {
  id: string;
  org_id: string;
  user_id: string;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  org?: {
    id: string;
    name: string;
    description: string | null;
    website: string | null;
    status: 'pending' | 'approved' | 'rejected';
  };
  user?: {
    id: string;
    display_name?: string;
  };
}

/**
 * Hook for users to manage their own applications to organizations
 */
export function useOrgApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<OrgMemberApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('org_member_applications')
        .select(`
          *,
          org:orgs(id, name, description, website, status)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications((data || []) as OrgMemberApplication[]);
    } catch (err) {
      console.error('Error fetching applications:', err);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const applyToOrg = async (orgId: string, message?: string) => {
    if (!user) {
      toast.error('You must be logged in to apply');
      return;
    }

    try {
      const { error } = await rpcApplyToOrg(orgId, message || null);
      if (error) throw error;

      toast.success('Application submitted successfully!');
      await fetchApplications();
    } catch (err: any) {
      console.error('Error applying to org:', err);
      toast.error(err.message || 'Failed to submit application');
      throw err;
    }
  };

  return {
    applications,
    loading,
    applyToOrg,
    refetch: fetchApplications,
  };
}

/**
 * Hook for org owners/admins to manage applications to their organization
 */
export function useOrgApplicationsForOrg(orgId: string | null) {
  const [applications, setApplications] = useState<OrgMemberApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('org_member_applications')
        .select(`
          *,
          user:profiles!org_member_applications_user_id_fkey(id, display_name)
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setApplications((data || []) as OrgMemberApplication[]);
    } catch (err) {
      console.error('Error fetching org applications:', err);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const approveApplication = async (applicationId: string) => {
    try {
      const { error } = await rpcApproveOrgMemberApplication(applicationId);
      if (error) throw error;

      toast.success('Application approved! User has been added to the organization.');
      await fetchApplications();
    } catch (err: any) {
      console.error('Error approving application:', err);
      toast.error(err.message || 'Failed to approve application');
      throw err;
    }
  };

  const rejectApplication = async (applicationId: string) => {
    try {
      const { error } = await rpcRejectOrgMemberApplication(applicationId);
      if (error) throw error;

      toast.success('Application rejected.');
      await fetchApplications();
    } catch (err: any) {
      console.error('Error rejecting application:', err);
      toast.error(err.message || 'Failed to reject application');
      throw err;
    }
  };

  return {
    applications,
    loading,
    approveApplication,
    rejectApplication,
    refetch: fetchApplications,
  };
}

