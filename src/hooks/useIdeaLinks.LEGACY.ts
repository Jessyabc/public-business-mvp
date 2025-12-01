/**
 * ⚠️ LEGACY - DO NOT USE ⚠️
 * 
 * This hook manages the deprecated `idea_links` table.
 * 
 * MIGRATION PATH:
 * - All new lineage should use `post_relations` table
 * - Use `usePosts()` hook with `createPostWithRelation()` instead
 * - Use standardized relation types: 'origin', 'reply', 'quote', 'cross_link'
 * 
 * This file is kept for backwards compatibility only.
 * It will be removed in a future release.
 * 
 * @deprecated Use post_relations via usePosts hook instead
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export type IdeaType = 'open_idea' | 'brainstorm' | 'business_insight';

export interface IdeaLink {
  id: string;
  source_id: string;
  source_type: IdeaType;
  target_id: string;
  target_type: IdeaType;
  created_by: string | null;
  created_at: string;
}

/**
 * @deprecated Use usePosts() with post_relations instead
 * 
 * Custom hook for managing idea lineage links via LEGACY idea_links table.
 * This table is deprecated in favor of public.post_relations.
 */
export function useIdeaLinks() {
  const [links, setLinks] = useState<IdeaLink[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    console.warn('⚠️ useIdeaLinks is DEPRECATED. Use post_relations via usePosts instead.');
    fetchLinks();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel("idea_links-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "idea_links" },
        () => {
          fetchLinks();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchLinks() {
    try {
      const { data, error } = await supabase
        .from("idea_links" as any)
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setLinks((data || []) as unknown as IdeaLink[]);
    } catch (error) {
      console.error("Error fetching idea links:", error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * @deprecated Use createPostWithRelation from usePosts instead
   */
  async function createLink(
    source_id: string,
    source_type: IdeaType,
    target_id: string,
    target_type: IdeaType
  ) {
    console.warn('⚠️ createLink is DEPRECATED. Use createPostWithRelation from usePosts instead.');
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create links",
        variant: "destructive"
      });
      return { data: null, error: new Error("Not authenticated") };
    }

    try {
      const { data, error } = await supabase
        .from("idea_links" as any)
        .insert([
          {
            source_id,
            source_type,
            target_id,
            target_type,
            created_by: user.id
          }
        ] as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Link created",
        description: `Successfully linked ${source_type} to ${target_type}`
      });

      await fetchLinks();
      return { data: data as unknown as IdeaLink, error: null };
    } catch (error) {
      console.error("Error creating link:", error);
      toast({
        title: "Error",
        description: "Failed to create link",
        variant: "destructive"
      });
      return { data: null, error };
    }
  }

  function getLinksForId(id: string, type?: IdeaType) {
    return links.filter(link => {
      const matchesId = link.source_id === id || link.target_id === id;
      const matchesType = !type || link.source_type === type || link.target_type === type;
      return matchesId && matchesType;
    });
  }

  function getSourcesFor(target_id: string, target_type?: IdeaType) {
    return links.filter(link => {
      const matchesTarget = link.target_id === target_id;
      const matchesType = !target_type || link.target_type === target_type;
      return matchesTarget && matchesType;
    });
  }

  function getTargetsFor(source_id: string, source_type?: IdeaType) {
    return links.filter(link => {
      const matchesSource = link.source_id === source_id;
      const matchesType = !source_type || link.source_type === source_type;
      return matchesSource && matchesType;
    });
  }

  function buildLineageChain(startId: string, startType: IdeaType) {
    const chain: IdeaLink[] = [];
    const visited = new Set<string>();

    function traverse(currentId: string, currentType: IdeaType) {
      if (visited.has(currentId)) return;
      visited.add(currentId);

      const outgoingLinks = getTargetsFor(currentId, currentType);
      outgoingLinks.forEach(link => {
        chain.push(link);
        traverse(link.target_id, link.target_type);
      });
    }

    traverse(startId, startType);
    return chain;
  }

  return {
    links,
    loading,
    createLink,
    getLinksForId,
    getSourcesFor,
    getTargetsFor,
    buildLineageChain,
    refresh: fetchLinks
  };
}
