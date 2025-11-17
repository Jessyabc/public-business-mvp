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
import { GlassCard } from '@/ui/components/GlassCard';
import { Search, X, Plus } from 'lucide-react';

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
      // Fetch recent brainstorm posts from posts table
      let query = supabase
        .from('posts')
        .select('id, title, content, created_at, type')
        .eq('type', 'brainstorm')
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
      // Determine kind based on mode
      const kind = mode === 'root' ? 'Spark' : 'Spark';
      const parent_post_id = mode === 'continue' ? parentId : null;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to create brainstorms');
        return;
      }

      // Insert into posts table
      const { data: newPost, error } = await supabase
        .from('posts')
        .insert([{
          kind,
          title: data.title || null,
          content: data.content,
          body: data.content,
          type: 'brainstorm',
          mode: 'public',
          visibility: 'public',
          status: 'active', // Auto-approve in dev
          user_id: user.id,
        }])
        .select('*')
        .single();

      if (error) {
        console.error('Insert error:', error);
        toast.error(error.message || 'Failed to create brainstorm');
        return;
      }

      // If continue mode, create the relation
      if (mode === 'continue' && parentId && newPost) {
        const { error: relationError } = await supabase
          .from('post_relations')
          .insert([{
            parent_post_id: parentId,
            child_post_id: newPost.id,
            relation_type: 'hard',
          }]);

        if (relationError) {
          console.error('Relation error:', relationError);
          // Don't fail the whole operation, just log
        }
      }

      // Create soft links if any selected
      if (selectedSoftLinks.length > 0 && newPost) {
        const relations = selectedSoftLinks.map((childId) => ({
          parent_post_id: newPost.id,
          child_post_id: childId,
          relation_type: 'soft' as const,
        }));

        const { error: softLinksError } = await supabase
          .from('post_relations')
          .insert(relations);

        if (softLinksError) {
          console.error('Error creating soft links:', softLinksError);
          // Don't fail the whole operation, just log
        }
      }

      toast.success(mode === 'root' ? 'New brainstorm created' : 'Brainstorm continued');

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
      <DialogContent className="bg-[var(--card-bg)] backdrop-blur-xl border-white/20 text-white max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            {mode === 'root' ? 'New Brainstorm' : 'Continue Brainstorm'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-4 overflow-hidden flex flex-col">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/90">Title (optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Brief title..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
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
                  <FormLabel className="text-white/90">Content *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your idea..."
                      className="min-h-[120px] bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-white/60 mt-1">
                    {field.value?.length || 0} / 1000 characters
                  </p>
                </FormItem>
              )}
            />

            {/* Soft Links Section */}
            <div className="flex-1 space-y-3 overflow-hidden flex flex-col">
              <FormLabel className="text-white/90 flex-shrink-0">Inspiration (soft links)</FormLabel>
              
              {/* Search */}
              <div className="relative flex-shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search recent posts..."
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
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
                        className="bg-[#3aa0ff]/20 text-white border-[#3aa0ff]/40 gap-1"
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
              <ScrollArea className="flex-1 rounded-md border border-white/10 bg-white/5 p-2">
                {isLoadingHistory ? (
                  <div className="text-center text-white/50 py-8">Loading...</div>
                ) : recentPosts.length === 0 ? (
                  <div className="text-center text-white/50 py-8">No recent posts found</div>
                ) : (
                  <div className="space-y-2">
                    {recentPosts.map((post) => {
                      const isSelected = selectedSoftLinks.includes(post.post_id);
                      const canAdd = selectedSoftLinks.length < 5;
                      
                      return (
                        <GlassCard
                          key={post.post_id}
                          className={`p-3 cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-[#3aa0ff]/60 bg-[#3aa0ff]/10' 
                              : 'hover:bg-white/10'
                          }`}
                          onClick={() => canAdd || isSelected ? toggleSoftLink(post.post_id) : null}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-white truncate">
                                {post.title || 'Untitled'}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs border-white/20 text-white/70">
                                  {post.post_type}
                                </Badge>
                                <span className="text-xs text-white/50">
                                  {new Date(post.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            {isSelected ? (
                              <X className="h-4 w-4 text-[#3aa0ff] flex-shrink-0" />
                            ) : canAdd ? (
                              <Plus className="h-4 w-4 text-white/50 flex-shrink-0" />
                            ) : null}
                          </div>
                        </GlassCard>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
              <p className="text-xs text-white/60 flex-shrink-0">
                {selectedSoftLinks.length} / 5 soft links selected
              </p>
            </div>

            <div className="flex gap-3 pt-2 flex-shrink-0">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#3aa0ff]/30 hover:bg-[#3aa0ff]/40 text-white border border-[#3aa0ff]/40 backdrop-blur-sm"
              >
                {isSubmitting ? 'Creating...' : mode === 'root' ? 'Create' : 'Continue'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
