import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OpenIdea {
  id: string;
  content: string;
  is_curated: boolean;
  linked_brainstorms_count: number;
  created_at: string;
  status?: string;
}

export interface IdeaBrainstorm {
  id: string;
  idea_id: string;
  title: string;
  content: string;
  author_user_id?: string;
  author_display_name: string;
  is_public: boolean;
  created_at: string;
}

export function useCuratedIdeas() {
  return useQuery({
    queryKey: ["curated-ideas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("open_ideas_public")
        .select("*")
        .eq("is_curated", true)
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
        .from("idea_brainstorms")
        .select(`
          *,
          open_ideas!inner(is_curated)
        `)
        .eq("open_ideas.is_curated", true)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data as IdeaBrainstorm[];
    },
  });
}

export function useOpenIdea(id: string) {
  return useQuery({
    queryKey: ["open-idea", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("open_ideas_public")
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
        .from("idea_brainstorms")
        .select("*")
        .eq("idea_id", ideaId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as IdeaBrainstorm[];
    },
    enabled: !!ideaId,
  });
}

export function useIdeaBrainstorm(id: string) {
  return useQuery({
    queryKey: ["idea-brainstorm", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("idea_brainstorms")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as IdeaBrainstorm;
    },
    enabled: !!id,
  });
}