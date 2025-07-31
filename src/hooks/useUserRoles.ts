import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'admin' | 'business_member' | 'business_user' | 'public_user';

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
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [canCreateBusinessPosts, setCanCreateBusinessPosts] = useState(false);

  const fetchUserRole = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      const role = data?.role || 'public_user';
      setUserRole(role);
      setCanCreateBusinessPosts(role === 'business_member' || role === 'admin');
    } catch (error: any) {
      console.error('Error fetching user role:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user role",
        variant: "destructive",
      });
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

  useEffect(() => {
    if (user) {
      fetchUserRole();
    } else {
      setUserRole(null);
      setCanCreateBusinessPosts(false);
    }
  }, [user]);

  return {
    userRole,
    canCreateBusinessPosts,
    loading,
    fetchUserRole,
    checkBusinessPostPermission,
    refetch: fetchUserRole,
  };
}