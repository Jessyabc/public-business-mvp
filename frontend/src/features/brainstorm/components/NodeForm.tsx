import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { BRAINSTORM_WRITES_ENABLED } from '@/config/flags';
import { supabase } from '@/integrations/supabase/client';
import { Search, X, Plus } from 'lucide-react';
import { useBrainstormExperienceStore } from '../stores/experience';
import type { BasePost } from '@/types/post';
import { buildSparkPayload } from '@/lib/posts';
import { canLink, type LineageNode } from '@/lib/lineageRules';

const nodeSchema = z.object({
  title: z.string().max(100, 'Title must be less than 100 characters').optional(),
  content: z.string().min(10, 'Content must be at least 10 characters').max(1000, 'Content must be less than 1000 characters'),
});

type NodeFormData = z.infer<typeof nodeSchema>;

type NodeFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'root' | 'continue';
  parentId?: string | null;
};

type RecentPost = {
  post_id: string;
  post_type: string;
  title: string;
  created_at: string;
};

export function NodeForm({ open, onOpenChange, mode, parentId }: NodeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [selectedSoftLinks, setSelectedSoftLinks] = useState<string[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const setActivePost = useBrainstormExperienceStore((state) => state.setActivePost);

  const form = useForm<NodeFormData>({
    resolver: zodResolver(nodeSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  // Load recent posts when dialog opens
  useEffect(() => {
    if (open) {
      loadRecentPosts();
      setSelectedSoftLinks([]);
    }
  }, [open]);

  // Search when query changes
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => loadRecentPosts(), 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, open]);

  const loadRecentPosts = async () => {
    setIsLoadingHistory(true);
    try {
      // Fetch recent brainstorm posts from posts table (public Sparks only)
      let query = supabase
        .from('posts')
        .select('id, title, content, created_at, type')
        .eq('type', 'brainstorm')
        .eq('kind', 'Spark')
        .eq('mode', 'public')
        .eq('visibility', 'public')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(15);

      // Add search filter if provided
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Map to RecentPost format
      const posts: RecentPost[] = (data || [])
        .filter((post: any) => {
          // Filter out parent if in continue mode
          if (mode === 'continue' && parentId && post.id === parentId) {
            return false;
          }
          return true;
        })
        .map((post: any) => ({
          post_id: post.id,
          post_type: post.type || 'brainstorm',
          title: post.title || 'Untitled',
          created_at: post.created_at,
        }));

      setRecentPosts(posts);
    } catch (err) {
      console.error('Failed to load recent posts:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const toggleSoftLink = (postId: string) => {
    setSelectedSoftLinks(prev => 
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : prev.length < 5
          ? [...prev, postId]
          : prev
    );
  };

  const removeSoftLink = (postId: string) => {
    setSelectedSoftLinks(prev => prev.filter(id => id !== postId));
  };

  const onSubmit = async (data: NodeFormData) => {
    if (!BRAINSTORM_WRITES_ENABLED) {
      toast.error('Brainstorm creation is currently disabled');
      return;
    }

    setIsSubmitting(true);
    try {
      // Get current user - enforce auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to create brainstorms');
        setIsSubmitting(false);
        return;
      }

      // Build canonical Spark payload
      const payload = buildSparkPayload({
        userId: user.id,
        content: data.content,
        title: data.title || null,
      });

      // Insert into posts table
      const { data: newPost, error } = await supabase
        .from('posts')
        .insert(payload)
        .select('*')
        .single();

      if (error) {
        // Error already shown via toast
        toast.error(error.message || 'Failed to create brainstorm');
        return;
      }

      // If continue mode, create the hard relation (continuation)
      if (mode === 'continue' && parentId && newPost) {
        // Fetch parent post to check lineage rules
        const { data: parentPost, error: parentError } = await supabase
          .from('posts')
          .select('id, type, kind')
          .eq('id', parentId)
          .single();

        if (parentError) {
          // Error already shown via toast
          toast.error('Failed to verify parent post');
        } else if (parentPost) {
          // Build LineageNode objects
          const parentNode: LineageNode = {
            id: parentPost.id,
            type: parentPost.type,
            kind: parentPost.kind || undefined,
          };
          const childNode: LineageNode = {
            id: newPost.id,
            type: newPost.type,
            kind: newPost.kind || undefined,
          };

          // Check if linking is allowed
          if (!canLink(parentNode, childNode, 'origin')) {
            console.warn('Lineage rule violation: Cannot link', {
              parent: { type: parentPost.type, kind: parentPost.kind },
              child: { type: newPost.type, kind: newPost.kind },
              relationType: 'origin',
            });
            toast.error('This type of post cannot be linked to that type of post yet.');
          } else {
            // Proceed with relation creation
            const { error: relationError } = await supabase
              .from('post_relations')
              .insert([{
                parent_post_id: parentId,
                child_post_id: newPost.id,
                relation_type: 'origin', // Continuation uses 'origin' relation (migrated from 'hard')
              }]);

            if (relationError) {
              console.error('Relation error:', relationError);
              // Don't fail the whole operation, just log
            }
          }
        }
      }

      // Create soft links if any selected (inspiration links)
      if (selectedSoftLinks.length > 0 && newPost) {
        // Fetch all child posts to check lineage rules
        const { data: childPosts, error: fetchError } = await supabase
          .from('posts')
          .select('id, type, kind')
          .in('id', selectedSoftLinks);

        if (fetchError) {
          console.error('Error fetching child posts:', fetchError);
          toast.error('Failed to verify linked posts');
        } else if (childPosts) {
          // Build parent node
          const parentNode: LineageNode = {
            id: newPost.id,
            type: newPost.type,
            kind: newPost.kind || undefined,
          };

          // Filter out disallowed relations
          const allowedRelations: Array<{ parent_post_id: string; child_post_id: string; relation_type: 'cross_link' }> = [];
          const disallowedPosts: string[] = [];

          for (const childPost of childPosts) {
            const childNode: LineageNode = {
              id: childPost.id,
              type: childPost.type,
              kind: childPost.kind || undefined,
            };

            if (canLink(parentNode, childNode, 'cross_link')) {
              allowedRelations.push({
                parent_post_id: newPost.id,
                child_post_id: childPost.id,
                relation_type: 'cross_link',
              });
            } else {
              disallowedPosts.push(childPost.id);
              console.warn('Lineage rule violation: Cannot link', {
                parent: { type: newPost.type, kind: newPost.kind },
                child: { type: childPost.type, kind: childPost.kind },
                relationType: 'soft',
              });
            }
          }

          // Show error if any relations were disallowed
          if (disallowedPosts.length > 0) {
            toast.error(
              `${disallowedPosts.length} of ${selectedSoftLinks.length} link${selectedSoftLinks.length > 1 ? 's' : ''} cannot be created. This type of post cannot be linked to that type of post yet.`
            );
          }

          // Insert only allowed relations
          if (allowedRelations.length > 0) {
            const { error: softLinksError } = await supabase
              .from('post_relations')
              .insert(allowedRelations);

            if (softLinksError) {
              console.error('Error creating soft links:', softLinksError);
              // Don't fail the whole operation, just log
            }
          }
        }
      }

      toast.success(mode === 'root' ? 'New brainstorm created' : 'Brainstorm continued');

      // Convert new post to BasePost format and set as active
      if (newPost) {
        const basePost: BasePost = {
          id: newPost.id,
          user_id: newPost.user_id || user.id,
          title: newPost.title || null,
          content: newPost.content || '',
          body: newPost.body || newPost.content || null,
          type: (newPost.type as BasePost['type']) || 'brainstorm',
          kind: (newPost.kind as BasePost['kind']) || 'Spark',
          visibility: (newPost.visibility as BasePost['visibility']) || 'public',
          mode: (newPost.mode as BasePost['mode']) || 'public',
          status: (newPost.status as BasePost['status']) || 'active',
          org_id: newPost.org_id || null,
          industry_id: newPost.industry_id || null,
          department_id: newPost.department_id || null,
          metadata: (newPost.metadata as BasePost['metadata']) || null,
          likes_count: 0,
          comments_count: 0,
          views_count: 0,
          t_score: newPost.t_score || null,
          u_score: newPost.u_score || null,
          published_at: newPost.published_at || null,
          created_at: newPost.created_at,
          updated_at: newPost.updated_at || newPost.created_at,
        };
        setActivePost(basePost);
      }

      form.reset();
      setSelectedSoftLinks([]);
      setSearchQuery('');
      onOpenChange(false);
      
      // Trigger feed refresh event
      window.dispatchEvent(new CustomEvent('pb:brainstorm:refresh'));
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[var(--surface)]/95 backdrop-blur-xl border border-white/10 text-foreground max-w-lg max-h-[85vh] flex flex-col shadow-[0_25px_80px_rgba(0,0,0,0.6),0_0_40px_rgba(72,159,227,0.15)] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            {mode === 'root' ? 'New Spark' : 'Continue Spark'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-4 overflow-hidden flex flex-col">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Title (optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Brief title..."
                      className="bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground rounded-xl focus:ring-2 focus:ring-[hsl(var(--accent))]/50 focus:border-transparent transition-all"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Your spark of inspiration *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Share your idea, thought, or insight..."
                      className="min-h-[120px] bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground resize-none rounded-xl focus:ring-2 focus:ring-[hsl(var(--accent))]/50 focus:border-transparent transition-all"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground mt-1">
                    {field.value?.length || 0} / 1000 characters
                  </p>
                </FormItem>
              )}
            />

            {/* Soft Links Section */}
            <div className="flex-1 space-y-3 overflow-hidden flex flex-col">
              <FormLabel className="text-foreground/80 flex-shrink-0">Link to existing Sparks (optional)</FormLabel>
              
              {/* Search */}
              <div className="relative flex-shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Sparks..."
                  className="pl-10 bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground rounded-xl focus:ring-2 focus:ring-[hsl(var(--accent))]/50 focus:border-transparent transition-all"
                  disabled={isSubmitting}
                />
              </div>

              {/* Selected soft links */}
              {selectedSoftLinks.length > 0 && (
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  {selectedSoftLinks.map(id => {
                    const post = recentPosts.find(p => p.post_id === id);
                    return (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="text-xs gap-1 bg-[hsl(var(--accent))]/20 border-[hsl(var(--accent))]/30 text-[hsl(var(--accent))]"
                      >
                        {post?.title || 'Unknown'}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-red-400"
                          onClick={() => removeSoftLink(id)}
                        />
                      </Badge>
                    );
                  })}
                </div>
              )}

              {/* Recent posts list */}
              <ScrollArea className="flex-1 rounded-xl border border-white/10 bg-white/5">
                {isLoadingHistory ? (
                  <div className="text-center text-muted-foreground py-8">Loading...</div>
                ) : recentPosts.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">No recent Sparks found</div>
                ) : (
                  <div className="p-2 space-y-1">
                    {recentPosts.map((post) => {
                      const isSelected = selectedSoftLinks.includes(post.post_id);
                      const canAdd = selectedSoftLinks.length < 5;
                      
                      return (
                        <button
                          key={post.post_id}
                          type="button"
                          onClick={() => canAdd || isSelected ? toggleSoftLink(post.post_id) : null}
                          className={`w-full text-left p-2 rounded-lg text-sm transition-all ${
                            isSelected 
                              ? 'bg-[hsl(var(--accent))]/20 border border-[hsl(var(--accent))]/40' 
                              : 'hover:bg-white/10 border border-transparent'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-foreground line-clamp-1">
                                {post.title || 'Untitled'}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {new Date(post.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            {isSelected ? (
                              <X className="h-4 w-4 text-[hsl(var(--accent))] flex-shrink-0" />
                            ) : canAdd ? (
                              <Plus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
              <p className="text-xs text-muted-foreground flex-shrink-0">
                {selectedSoftLinks.length} / 5 links selected
              </p>
            </div>

            <div className="flex gap-3 pt-2 flex-shrink-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/90 text-white font-medium shadow-[0_0_20px_rgba(72,159,227,0.3)] hover:shadow-[0_0_30px_rgba(72,159,227,0.5)] transition-all duration-300 disabled:opacity-50 disabled:shadow-none"
              >
                {isSubmitting ? 'Creating...' : mode === 'root' ? 'Create Spark' : 'Continue Spark'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
