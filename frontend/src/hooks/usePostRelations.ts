/**
 * Hook for managing post relations using the canonical post_relations table
 * 
 * This is the CANONICAL way to work with lineage between posts.
 * Use this instead of legacy idea_links or other link tables.
 * 
 * Standardized relation types:
 * - 'origin' - Parent is the origin/source of child (e.g., idea → insight)
 * - 'reply' - Child responds to parent (e.g., comment, continuation) 
 * - 'quote' - Child quotes/references parent
 * - 'cross_link' - Bidirectional association
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import type { PostRelation, PostRelationType } from '@/types/post';

export function usePostRelations(postId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch relations for a specific post
  const { data: relations, isLoading } = useQuery({
    queryKey: ['post-relations', postId],
    queryFn: async () => {
      if (!postId) return [];
      
      const { data, error } = await supabase
        .from('post_relations')
        .select('*')
        .or(`parent_post_id.eq.${postId},child_post_id.eq.${postId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as PostRelation[];
    },
    enabled: !!postId,
  });

  // Create a relation using the validated database function
  const createRelation = useMutation({
    mutationFn: async ({
      parentPostId,
      childPostId,
      relationType,
    }: {
      parentPostId: string;
      childPostId: string;
      relationType: PostRelationType;
    }) => {
      const { data, error } = await supabase.rpc('create_post_relation', {
        p_parent_post_id: parentPostId,
        p_child_post_id: childPostId,
        p_relation_type: relationType,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-relations'] });
      toast({
        title: 'Relation created',
        description: 'Successfully linked posts',
      });
    },
    onError: (error: any) => {
      console.error('Error creating relation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create relation',
        variant: 'destructive',
      });
    },
  });

  // Delete a relation
  const deleteRelation = useMutation({
    mutationFn: async (relationId: string) => {
      const { error } = await supabase
        .from('post_relations')
        .delete()
        .eq('id', relationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-relations'] });
      toast({
        title: 'Relation deleted',
        description: 'Successfully removed link',
      });
    },
    onError: (error: any) => {
      console.error('Error deleting relation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete relation',
        variant: 'destructive',
      });
    },
  });

  // Get children (outgoing relations from this post)
  const children = relations?.filter(r => r.parent_post_id === postId) || [];
  
  // Get parents (incoming relations to this post)
  const parents = relations?.filter(r => r.child_post_id === postId) || [];

  // Categorize by type
  const byType = {
    origin: relations?.filter(r => r.relation_type === 'origin') || [],
    reply: relations?.filter(r => r.relation_type === 'reply') || [],
    quote: relations?.filter(r => r.relation_type === 'quote') || [],
    cross_link: relations?.filter(r => r.relation_type === 'cross_link') || [],
  };

  return {
    relations: relations || [],
    children,
    parents,
    byType,
    isLoading,
    createRelation: createRelation.mutate,
    deleteRelation: deleteRelation.mutate,
    isCreating: createRelation.isPending,
    isDeleting: deleteRelation.isPending,
  };
}
