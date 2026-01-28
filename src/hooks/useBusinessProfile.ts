import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BusinessProfile, Industry, Department } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useBusinessProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select(`
          *,
          industry:industries(*),
          department:departments(*)
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error: unknown) {
      console.error('Error fetching business profile:', error);
      let description = 'Failed to fetch business profile';
      if (error instanceof Error) {
        description = error.message;
      } else if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        description = (error as { message: string }).message;
      }
      toast({
        title: "Error",
        description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const fetchIndustries = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('industries')
        .select('*')
        .order('name');

      if (error) throw error;
      setIndustries(data || []);
    } catch (error: unknown) {
      console.error('Error fetching industries:', error);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error: unknown) {
      console.error('Error fetching departments:', error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchIndustries();
      fetchDepartments();
    }
  }, [user, fetchProfile, fetchIndustries, fetchDepartments]);

  const createProfile = async (profileData: any) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .insert({
          user_id: user.id,
          ...profileData,
        })
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data as BusinessProfile);
      toast({
        title: "Success",
        description: "Business profile created successfully",
      });
      return data;
    } catch (error: unknown) {
      console.error('Error creating business profile:', error);
      let description = 'Failed to create business profile';
      if (error instanceof Error) {
        description = error.message;
      } else if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        description = (error as { message: string }).message;
      }
      toast({
        title: "Error",
        description,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: any) => {
    if (!user || !profile) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .update(profileData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data as BusinessProfile);
      toast({
        title: "Success",
        description: "Business profile updated successfully",
      });
      return data;
    } catch (error: unknown) {
      console.error('Error updating business profile:', error);
      let description = 'Failed to update business profile';
      if (error instanceof Error) {
        description = error.message;
      } else if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        description = (error as { message: string }).message;
      }
      toast({
        title: "Error",
        description,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    industries,
    departments,
    loading,
    createProfile,
    updateProfile,
    refetch: fetchProfile,
  };
}