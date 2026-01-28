// src/hooks/useProfileActions.ts
import { supabase } from "@/integrations/supabase/client";
import { safeUrlOrEmpty } from "@/lib/validators";

export async function updateProfile(userId: string, profile: any) {
  const updatedProfile = {
    id: userId,
    display_name: profile.display_name,
    avatar_url: profile.avatar_url,
    bio: profile.bio,
    website: safeUrlOrEmpty(profile.website),
    linkedin_url: safeUrlOrEmpty(profile.linkedin_url),
    company: profile.company,
    location: profile.location,
    is_completed: true,
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(updatedProfile, { onConflict: "id" })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}
