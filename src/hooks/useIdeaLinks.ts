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
 * Custom hook for managing idea lineage links
 * 
 * Tracks relationships between Open Ideas, Brainstorms, and Business Insights
 * Supports realtime updates via Supabase subscriptions
 */
export function useIdeaLinks() {
  const [links, setLinks] = useState<IdeaLink[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
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
   * Create a new link between two ideas
   * @param source_id - UUID of the source idea
   * @param source_type - Type of source (open_idea, brainstorm, business_insight)
   * @param target_id - UUID of the target idea
   * @param target_type - Type of target (open_idea, brainstorm, business_insight)
   */
  async function createLink(
    source_id: string,
    source_type: IdeaType,
    target_id: string,
    target_type: IdeaType
  ) {
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

  /**
   * Get all links where the given ID is either source or target
   * @param id - UUID to search for
   * @param type - Optional type filter
   */
  function getLinksForId(id: string, type?: IdeaType) {
    return links.filter(link => {
      const matchesId = link.source_id === id || link.target_id === id;
      const matchesType = !type || link.source_type === type || link.target_type === type;
      return matchesId && matchesType;
    });
  }

  /**
   * Get all sources that link to a target
   * @param target_id - UUID of target idea
   * @param target_type - Type of target
   */
  function getSourcesFor(target_id: string, target_type?: IdeaType) {
    return links.filter(link => {
      const matchesTarget = link.target_id === target_id;
      const matchesType = !target_type || link.target_type === target_type;
      return matchesTarget && matchesType;
    });
  }

  /**
   * Get all targets that a source links to
   * @param source_id - UUID of source idea
   * @param source_type - Type of source
   */
  function getTargetsFor(source_id: string, source_type?: IdeaType) {
    return links.filter(link => {
      const matchesSource = link.source_id === source_id;
      const matchesType = !source_type || link.source_type === source_type;
      return matchesSource && matchesType;
    });
  }

  /**
   * Build a lineage chain from an open idea through brainstorms to insights
   * @param startId - Starting UUID
   * @param startType - Starting type
   */
  function buildLineageChain(startId: string, startType: IdeaType) {
    const chain: IdeaLink[] = [];
    const visited = new Set<string>();

    function traverse(currentId: string, currentType: IdeaType) {
      if (visited.has(currentId)) return; // Prevent cycles
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
