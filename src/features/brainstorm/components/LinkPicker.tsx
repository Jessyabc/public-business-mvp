import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { GlassCard } from '@/ui/components/GlassCard';
import { Search, X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBrainstormExperienceStore } from '../stores/experience';

type LinkPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceId: string | null;
};

type RecentPost = {
  post_id: string;
  post_type: string;
  title: string;
  created_at: string;
};

export function LinkPicker({ open, onOpenChange, sourceId }: LinkPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setActivePostById = useBrainstormExperienceStore((state) => state.setActivePostById);

  // Load recent posts when dialog opens
  useEffect(() => {
    if (open && sourceId) {
      loadRecentPosts();
      setSelectedLinks([]);
    }
  }, [open, sourceId]);

  // Search when query changes
  useEffect(() => {
    if (open && sourceId) {
      const timer = setTimeout(() => loadRecentPosts(), 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, open, sourceId]);

  const loadRecentPosts = async () => {
    setIsLoading(true);
    try {
      // Fetch recent spark posts from posts table (public Sparks only)
      let query = supabase
        .from('posts')
        .select('id, title, content, created_at, kind')
        .eq('type', 'brainstorm')
        .eq('kind', 'Spark')
        .eq('mode', 'public')
        .eq('visibility', 'public')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      // Add search filter if provided
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Map to RecentPost format and filter out source post
      const posts: RecentPost[] = (data || [])
        .filter((post: any) => post.id !== sourceId)
        .map((post: any) => ({
          post_id: post.id,
          post_type: 'Spark',
          title: post.title || 'Untitled',
          created_at: post.created_at,
        }));

      setRecentPosts(posts);
    } catch (err) {
      console.error('Failed to load recent posts:', err);
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLink = (postId: string) => {
    setSelectedLinks(prev => 
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : prev.length < 5
          ? [...prev, postId]
          : prev
    );
  };

  const removeLink = (postId: string) => {
    setSelectedLinks(prev => prev.filter(id => id !== postId));
  };

  const handleSubmit = async () => {
    if (!sourceId || selectedLinks.length === 0) {
      toast.error('Please select at least one post to link');
      return;
    }

    setIsSubmitting(true);
    try {
      // Insert soft link relations directly into post_relations
      const relations = selectedLinks.map((childId) => ({
        parent_post_id: sourceId,
        child_post_id: childId,
        relation_type: 'soft' as const,
      }));

      const { error } = await supabase
        .from('post_relations')
        .insert(relations);

      if (error) {
        throw error;
      }

      toast.success(`Created ${selectedLinks.length} soft link${selectedLinks.length > 1 ? 's' : ''}`);
      
      // Update active post to trigger refresh of cross-links and graph
      if (sourceId) {
        setActivePostById(sourceId);
      }
      
      // Clear and close
      setSelectedLinks([]);
      setSearchQuery('');
      onOpenChange(false);
      
      // Trigger feed refresh
      window.dispatchEvent(new CustomEvent('pb:brainstorm:refresh'));
    } catch (err) {
      console.error('Failed to create links:', err);
      toast.error('Failed to create soft links');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[var(--card-bg)] backdrop-blur-xl border-white/20 text-white max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Link to Existing Posts
          </DialogTitle>
          <p className="text-sm text-white/70">
            Create soft links (inspiration connections) to existing posts
          </p>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts to link..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              disabled={isSubmitting}
            />
          </div>

          {/* Selected links */}
          {selectedLinks.length > 0 && (
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              {selectedLinks.map(id => {
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
                      onClick={() => removeLink(id)}
                    />
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Posts list */}
          <ScrollArea className="flex-1 rounded-md border border-white/10 bg-white/5 p-2">
            {isLoading ? (
              <div className="text-center text-white/50 py-8">Loading posts...</div>
            ) : recentPosts.length === 0 ? (
              <div className="text-center text-white/50 py-8">No posts found</div>
            ) : (
              <div className="space-y-2">
                {recentPosts.map((post) => {
                  const isSelected = selectedLinks.includes(post.post_id);
                  const canAdd = selectedLinks.length < 5;
                  
                  return (
                    <GlassCard
                      key={post.post_id}
                      className={`p-3 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-[#3aa0ff]/60 bg-[#3aa0ff]/10' 
                          : 'hover:bg-white/10'
                      }`}
                      onClick={() => canAdd || isSelected ? toggleLink(post.post_id) : null}
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
            {selectedLinks.length} / 5 soft links selected
          </p>
        </div>

        <div className="flex gap-3 pt-2 flex-shrink-0">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedLinks.length === 0}
            className="flex-1 bg-[#3aa0ff]/30 hover:bg-[#3aa0ff]/40 text-white border border-[#3aa0ff]/40 backdrop-blur-sm"
          >
            {isSubmitting ? 'Creating Links...' : `Link ${selectedLinks.length} Post${selectedLinks.length !== 1 ? 's' : ''}`}
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
      </DialogContent>
    </Dialog>
  );
}
