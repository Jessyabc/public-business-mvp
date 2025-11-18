import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BusinessMembershipStatus {
  isBusinessMember: boolean;
  orgId: string | null;
  loading: boolean;
}

/**
 * Hook to check if current user is a business member
 * Checks both profile.is_business_member and org_members table
 */
export function useBusinessMembership(): BusinessMembershipStatus {
  const { user } = useAuth();
  const [status, setStatus] = useState<BusinessMembershipStatus>({
    isBusinessMember: false,
    orgId: null,
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setStatus({ isBusinessMember: false, orgId: null, loading: false });
      return;
    }

    async function checkMembership() {
      try {
        // Check profile first
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_business_member, business_profile_id')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        if (profile?.is_business_member && profile?.business_profile_id) {
          setStatus({
            isBusinessMember: true,
            orgId: profile.business_profile_id,
            loading: false,
          });
          return;
        }

        // Fallback: check org_members table
        const { data: membership, error: memberError } = await supabase
          .from('org_members')
          .select('org_id')
          .eq('user_id', user.id)
          .limit(1)
          .single();

        if (memberError && memberError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" which is fine
          throw memberError;
        }

        if (membership) {
          setStatus({
            isBusinessMember: true,
            orgId: membership.org_id,
            loading: false,
          });
        } else {
          setStatus({
            isBusinessMember: false,
            orgId: null,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Error checking business membership:', error);
        setStatus({ isBusinessMember: false, orgId: null, loading: false });
      }
    }

    checkMembership();
  }, [user]);

  return status;
}

