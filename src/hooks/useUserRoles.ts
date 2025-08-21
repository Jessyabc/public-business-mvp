import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'admin' | 'business_user' | 'public_user' | 'business_member';

export interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export function useUserRoles() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [canCreateBusinessPosts, setCanCreateBusinessPosts] = useState(false);

  const fetchUserRoles = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_my_roles');
      
      if (error) throw error;
      
      const roles = (data ?? []) as Array<'admin'|'business_user'|'public_user'|'business_member'>;
      setUserRoles(roles.length ? roles : ['public_user']);
      setCanCreateBusinessPosts(roles.includes('business_member') || roles.includes('admin'));
    } catch (error: any) {
      console.error('Error fetching user roles:', error);
      // Default to public_user if there's an error
      setUserRoles(['public_user']);
    } finally {
      setLoading(false);
    }
  };

  const checkBusinessPostPermission = async () => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase.rpc('can_create_business_posts', { 
        user_uuid: user.id 
      });
      
      if (error) throw error;
      return data || false;
    } catch (error: any) {
      console.error('Error checking business post permission:', error);
      return false;
    }
  };

  const hasRole = (role: UserRole) => {
    return userRoles.includes(role);
  };

  const isPublicUser = () => hasRole('public_user');
  const isBusinessMember = () => hasRole('business_member');
  const isBusinessUser = () => hasRole('business_user');
  const isAdmin = () => hasRole('admin');

  useEffect(() => {
    if (user) {
      fetchUserRoles();
    } else {
      setUserRoles([]);
      setCanCreateBusinessPosts(false);
    }
  }, [user]);

  return {
    userRoles,
    hasRole,
    isPublicUser,
    isBusinessMember,
    isBusinessUser,
    isAdmin,
    canCreateBusinessPosts,
    loading,
    fetchUserRoles,
    checkBusinessPostPermission,
    refetch: fetchUserRoles,
  };
}