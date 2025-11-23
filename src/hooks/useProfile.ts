// src/hooks/useProfile.ts
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { safeUrlOrEmpty } from "@/lib/validators";

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  linkedin_url: string | null;
  company: string | null;
  location: string | null;
  is_completed?: boolean | null;
};

const makeEmptyProfile = (id: string, fallbackName?: string | null): Profile => ({
  id,
  display_name: fallbackName ?? "",
  avatar_url: null,
  bio: null,
  website: null,
  linkedin_url: null,
  company: null,
  location: null,
  is_completed: false,
});

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setProfile(makeEmptyProfile(user.id, user.user_metadata?.name));
      } else {
        // type sûre : on s'assure que toutes les clés existent
        const p = data as Partial<Profile>;
        setProfile({
          id: user.id,
          display_name: p.display_name ?? "",
          avatar_url: p.avatar_url ?? null,
          bio: p.bio ?? null,
          website: p.website ?? null,
          linkedin_url: p.linkedin_url ?? null,
          company: p.company ?? null,
          location: p.location ?? null,
          is_completed: p.is_completed ?? null,
        });
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err.message ?? "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!user) return { error: new Error("No user found") };

      try {
        // On construit un objet COMPLET (toutes les propriétés de Profile)
        const current = profile ?? makeEmptyProfile(user.id, user.user_metadata?.name);
        const merged: Profile = {
          id: user.id,
          display_name: updates.display_name ?? current.display_name ?? "",
          avatar_url: updates.avatar_url ?? current.avatar_url ?? null,
          bio: updates.bio ?? current.bio ?? null,
          website: safeUrlOrEmpty(
            (updates.website ?? current.website) as string | null | undefined
          ),
          linkedin_url: safeUrlOrEmpty(
            (updates.linkedin_url ?? current.linkedin_url) as string | null | undefined
          ),
          company: updates.company ?? current.company ?? null,
          location: updates.location ?? current.location ?? null,
          is_completed:
            updates.is_completed ??
            current.is_completed ??
            (updates.display_name || updates.bio || updates.location ? true : null),
        };

        const { data, error } = await supabase
          .from("profiles")
          .upsert(merged, { onConflict: "id" })
          .select()
          .maybeSingle();

        if (error) throw error;

        const profileData = data ? {
          ...data,
          linkedin_url: data['Social Media'] || null
        } as Profile : merged;
        
        setProfile(profileData);
        return { error: null };
      } catch (err: any) {
        console.error("Error updating profile:", err);
        return { error: err };
      }
    },
    [user, profile]
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, fetchProfile, updateProfile, setProfile };
}
