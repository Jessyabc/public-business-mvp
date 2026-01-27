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
  social_media: string | null;
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
  social_media: null,
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
        setProfile({
          id: user.id,
          display_name: data.display_name ?? "",
          avatar_url: data.avatar_url ?? null,
          bio: data.bio ?? null,
          website: data.website ?? null,
          social_media: data['Social Media'] ?? null,
          company: data.company ?? null,
          location: data.location ?? null,
          is_completed: data.is_completed ?? null,
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
        const current = profile ?? makeEmptyProfile(user.id, user.user_metadata?.name);
        
        // Build the database object with the correct column name
        const dbPayload = {
          id: user.id,
          display_name: updates.display_name ?? current.display_name ?? "",
          avatar_url: updates.avatar_url ?? current.avatar_url ?? null,
          bio: updates.bio ?? current.bio ?? null,
          website: safeUrlOrEmpty(
            (updates.website ?? current.website) as string | null | undefined
          ),
          "Social Media": updates.social_media ?? current.social_media ?? null,
          company: updates.company ?? current.company ?? null,
          location: updates.location ?? current.location ?? null,
          is_completed:
            updates.is_completed ??
            current.is_completed ??
            (updates.display_name || updates.bio || updates.location ? true : null),
        };

        const { data, error } = await supabase
          .from("profiles")
          .upsert(dbPayload, { onConflict: "id" })
          .select()
          .maybeSingle();

        if (error) throw error;

        // Map back to Profile type
        const profileData: Profile = {
          id: user.id,
          display_name: data?.display_name ?? dbPayload.display_name,
          avatar_url: data?.avatar_url ?? dbPayload.avatar_url,
          bio: data?.bio ?? dbPayload.bio,
          website: data?.website ?? dbPayload.website,
          social_media: data?.['Social Media'] ?? dbPayload['Social Media'],
          company: data?.company ?? dbPayload.company,
          location: data?.location ?? dbPayload.location,
          is_completed: data?.is_completed ?? dbPayload.is_completed,
        };
        
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
