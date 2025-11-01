import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OpenIdea {
  id: string;
  content: string;
  created_at: string;
  source: 'intake' | 'user';
}

export interface IdeaBrainstorm {
  id: string;
  idea_id?: string; // optional for backward compatibility
  title: string;
  content: string;
  user_id?: string;
  author_user_id?: string;
  author_display_name?: string;
  visibility: string;
  is_public: boolean;
  created_at: string;
}

export function useCuratedIdeas() {
  return useQuery({
    queryKey: ["curated-ideas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("open_ideas_public_view")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as OpenIdea[];
    },
  });
}

export function useFreeBrainstorms() {
  return useQuery({
    queryKey: ["free-brainstorms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("type", "brainstorm")
        .eq("visibility", "public")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      
      // Map to IdeaBrainstorm format
      return (data || []).map((post: any) => ({
        ...post,
        author_user_id: post.user_id,
        is_public: post.visibility === 'public',
      })) as IdeaBrainstorm[];
    },
  });
}

export function useOpenIdea(id: string) {
  return useQuery({
    queryKey: ["open-idea", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("open_ideas_public_view")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as OpenIdea;
    },
    enabled: !!id,
  });
}

export function useIdeaBrainstorms(ideaId: string) {
  return useQuery({
    queryKey: ["idea-brainstorms", ideaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("type", "brainstorm")
        .eq("visibility", "public")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Map to IdeaBrainstorm format
      return (data || []).map((post: any) => ({
        ...post,
        author_user_id: post.user_id,
        is_public: post.visibility === 'public',
      })) as IdeaBrainstorm[];
    },
    enabled: !!ideaId,
  });
}

export function useIdeaBrainstorm(id: string) {
  return useQuery({
    queryKey: ["idea-brainstorm", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .eq("type", "brainstorm")
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;
      
      // Map to IdeaBrainstorm format
      return {
        ...data,
        author_user_id: data.user_id,
        is_public: data.visibility === 'public',
      } as IdeaBrainstorm;
    },
    enabled: !!id,
  });
}