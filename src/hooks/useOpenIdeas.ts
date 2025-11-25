import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

export interface OpenIdea {
  id: string;
  content: string;
  created_at: string;
  source: 'intake' | 'user';
}

export interface UnifiedOpenIdea {
  id: string;
  text: string;
  status: string;
  created_at: string;
  source: 'user' | 'anon';
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

/**
 * Hook to fetch open ideas from both open_ideas_user and open_ideas_intake tables
 * Returns unified array with source indicator
 */
export function useOpenIdeas() {
  const [ideas, setIdeas] = useState<UnifiedOpenIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIdeas = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch from both tables in parallel
        const [userIdeasResult, intakeIdeasResult] = await Promise.all([
          supabase
            .from('open_ideas_user')
            .select('id, text, status, created_at')
            .order('created_at', { ascending: false }),
          supabase
            .from('open_ideas_intake')
            .select('id, text, status, created_at')
            .order('created_at', { ascending: false })
        ]);

        if (userIdeasResult.error) throw userIdeasResult.error;
        if (intakeIdeasResult.error) throw intakeIdeasResult.error;

        // Map and combine results
        const userIdeas: UnifiedOpenIdea[] = (userIdeasResult.data || []).map(idea => ({
          id: idea.id,
          text: idea.text,
          status: idea.status,
          created_at: idea.created_at || new Date().toISOString(),
          source: 'user' as const,
        }));

        const intakeIdeas: UnifiedOpenIdea[] = (intakeIdeasResult.data || []).map(idea => ({
          id: idea.id,
          text: idea.text,
          status: idea.status,
          created_at: idea.created_at || new Date().toISOString(),
          source: 'anon' as const,
        }));

        // Combine and sort by created_at descending
        const allIdeas = [...userIdeas, ...intakeIdeas].sort((a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA;
        });

        setIdeas(allIdeas);
      } catch (err) {
        console.error('Error fetching open ideas:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch open ideas');
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, []);

  return { ideas, loading, error };
}