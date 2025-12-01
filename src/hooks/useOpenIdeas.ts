// LEGACY – do not extend. Kept temporarily for reference during migration.
// New code should use the posts system (usePosts) for all content including ideas.
// This uses legacy open_ideas tables that are being phased out.

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

export interface CuratedOpenIdea {
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

export type OpenIdea = {
  id: string;
  text: string;
  source: 'user' | 'anon';
  status: string;
  created_at: string | null;
  user_id?: string | null;
};

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
      return data as CuratedOpenIdea[];
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
      return data as CuratedOpenIdea;
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
  const [ideas, setIdeas] = useState<OpenIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [userRes, anonRes] = await Promise.all([
          supabase
            .from('open_ideas_user')
            .select('id, text, status, created_at, user_id')
            .order('created_at', { ascending: false }),
          supabase
            .from('open_ideas_intake')
            .select('id, text, status, created_at')
            .order('created_at', { ascending: false }),
        ]);

        if (userRes.error) throw userRes.error;
        if (anonRes.error) throw anonRes.error;

        if (cancelled) return;

        const userIdeas = userRes.data;
        const anonIdeas = anonRes.data;

        const merged: OpenIdea[] = [
          ...(userIdeas ?? []).map((row) => ({
            id: row.id,
            text: row.text,
            status: row.status,
            created_at: row.created_at,
            user_id: row.user_id,
            source: 'user' as const,
          })),
          ...(anonIdeas ?? []).map((row) => ({
            id: row.id,
            text: row.text,
            status: row.status,
            created_at: row.created_at,
            user_id: null,
            source: 'anon' as const,
          })),
        ].sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA; // Descending (newest first)
        });

        setIdeas(merged);
      } catch (e: any) {
        console.error('Failed to load open ideas', e);
        if (!cancelled) {
          const errorMessage = e?.message || e?.error?.message || 'Failed to load open ideas';
          setError(errorMessage);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { ideas, loading, error };
}