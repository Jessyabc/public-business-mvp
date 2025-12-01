import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useUserRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = useCallback(async () => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    try {
      // Use the RPC function to get user roles
      const { data, error } = await supabase.rpc('get_my_roles');
      
      if (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
      } else {
        setRoles(data || []);
      }
    } catch (error) {
      console.error('Unexpected error fetching roles:', error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const hasRole = (role: string) => roles.includes(role);
  const hasAnyRole = (roleList: string[]) => roleList.some(role => roles.includes(role));
  
  return {
    roles,
    loading,
    hasRole,
    hasAnyRole,
    isAdmin: () => hasRole('admin'),
    isBusinessMember: () => hasRole('business_member') || hasRole('business_user') || hasRole('admin'),
    isBusinessUser: () => hasRole('business_user'),
    isPublicUser: () => hasRole('public_user'),
    canCreateBusinessPosts: hasAnyRole(['admin', 'business_member', 'business_user']),
    // Backward compatibility
    userRoles: roles,
    refetch: () => {
      fetchRoles();
    },
  };
}