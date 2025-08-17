import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  linkedin_url: string | null;
  company: string | null;
  location: string | null;
  is_completed: boolean | null;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      setProfile(data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
  if (!user) return { error: new Error("No user found") };

  try {
    const payload = {
      id: user.id,
      // keep existing fields if we have them, otherwise undefined (upsert fills what you pass)
      ...profile,
      ...updates,
      // optional: automatically mark completed if core fields present
      is_completed:
        updates.is_completed ??
        (("display_name" in updates || "bio" in updates || "location" in updates) 
          ? true 
          : profile?.is_completed ?? null),
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (error) throw error;

    setProfile(data ?? payload);
    return { error: null };
  } catch (err: any) {
    console.error('Error updating profile:', err);
    return { error: err };
  }
};
  
const fetchProfile = async () => {
  if (!user) { setProfile(null); setLoading(false); return; }
  try {
    setLoading(true); setError(null);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      // create an empty row so UI is ready for editing
      const { data: created, error: upsertErr } = await supabase
        .from('profiles')
        .upsert({ id: user.id })
        .select()
        .maybeSingle();
      if (upsertErr) throw upsertErr;
      setProfile(created ?? { id: user.id } as any);
    } else {
      setProfile(data);
    }
  } catch (err: any) {
    console.error('Error fetching profile:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
}