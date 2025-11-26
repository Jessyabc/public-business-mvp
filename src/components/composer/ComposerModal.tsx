import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassSurface } from "@/components/ui/GlassSurface";
import { Label } from "@/components/ui/label";
import { Brain, FileText, AlertCircle, Link2, X, Search } from "lucide-react";
import { useAppMode } from "@/contexts/AppModeContext";
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from "@/hooks/useUserRoles";
import { useComposerStore } from "@/hooks/useComposerStore";
import { toast } from 'sonner';
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { buildPublicSparkPayload, buildBusinessInsightPayload } from "@/lib/postPayloads";
interface ComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const PUBLIC_MAX_CHARS = 5000;
const BUSINESS_MAX_CHARS = 10000;
export function ComposerModal({
  isOpen,
  onClose
}: ComposerModalProps) {
  const {
    mode
  } = useAppMode();
  const {
    user
  } = useAuth();
  const {
    isBusinessMember
  } = useUserRoles();
  const {
    setContext,
    context
  } = useComposerStore();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [composerMode, setComposerMode] = useState<'post' | 'open-idea'>('post');

  // Link selector state
  const [showLinkSelector, setShowLinkSelector] = useState(false);
  const [linkSearch, setLinkSearch] = useState("");
  const [availablePosts, setAvailablePosts] = useState<any[]>([]);
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const isPublicMode = mode === 'public';
  const maxChars = isPublicMode ? PUBLIC_MAX_CHARS : BUSINESS_MAX_CHARS;
  const canSubmit = content.trim().length > 0 && content.length <= maxChars;

  // Load draft from localStorage
  useEffect(() => {
    if (isOpen) {
      const draftKey = isPublicMode ? 'composer:brainstorm' : 'composer:insight';
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          setContent(draft.content || '');
          setTitle(draft.title || '');
        } catch (e) {
          console.error('Failed to load draft:', e);
        }
      }
    }
  }, [isOpen, isPublicMode]);

  // Auto-save draft to localStorage
  useEffect(() => {
    if (isOpen && (content || title)) {
      const draftKey = isPublicMode ? 'composer:brainstorm' : 'composer:insight';
      const draft = {
        content,
        title
      };
      localStorage.setItem(draftKey, JSON.stringify(draft));
    }
  }, [content, title, isOpen, isPublicMode]);
  const handleClose = () => {
    setContent("");
    setTitle("");
    setComposerMode('post');
    setShowLinkSelector(false);
    setLinkSearch("");
    setSelectedLinks([]);
    setAvailablePosts([]);
    setContext(null);
    onClose();
  };
  const clearDraft = () => {
    const draftKey = isPublicMode ? 'composer:brainstorm' : 'composer:insight';
    localStorage.removeItem(draftKey);
  };

  // Load recent posts for linking (public Sparks only)
  const loadRecentPosts = async () => {
    setLoadingPosts(true);
    try {
      let query = supabase.from('posts').select('id, title, content, created_at').eq('type', 'brainstorm').eq('kind', 'Spark').eq('mode', 'public').eq('visibility', 'public').eq('status', 'active').order('created_at', {
        ascending: false
      }).limit(20);
      if (linkSearch.trim()) {
        query = query.or(`title.ilike.%${linkSearch}%,content.ilike.%${linkSearch}%`);
      }
      const {
        data,
        error
      } = await query;
      if (error) throw error;
      setAvailablePosts(data || []);
    } catch (err) {
      console.error('Failed to load posts:', err);
      toast.error('Failed to load posts');
    } finally {
      setLoadingPosts(false);
    }
  };

  // Load posts when link selector opens or search changes
  useEffect(() => {
    if (showLinkSelector) {
      const timer = setTimeout(() => loadRecentPosts(), 300);
      return () => clearTimeout(timer);
    }
  }, [showLinkSelector, linkSearch]);
  const toggleLink = (postId: string) => {
    setSelectedLinks(prev => prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]);
  };
  const handleCreate = async () => {
    if (!canSubmit || isSubmitting) return;

    // Enforce auth - no anonymous posts
    if (!user) {
      toast.error('You need an account to post.');
      return;
    }

    // Business mode validation
    if (!isPublicMode && !isBusinessMember()) {
      toast.error('Business membership required');
      return;
    }
    setIsSubmitting(true);
    try {
      let payload;
      
      if (isPublicMode) {
        // Public Spark (brainstorm)
        // Get originOpenIdeaId from context if available
        payload = buildPublicSparkPayload({
          userId: user.id,
          content,
          title: undefined,
          originOpenIdeaId: context?.originOpenIdeaId,
        });
      } else {
        // Business Insight
        // Get the user's org_id from their membership
        const {
          data: orgId,
          error: orgError
        } = await supabase.rpc('get_user_org_id');
        if (orgError || !orgId) {
          toast.error('You must be a member of an organization to create business insights');
          setIsSubmitting(false);
          return;
        }
        
        if (!title.trim()) {
          toast.error('Business insights require a title');
          setIsSubmitting(false);
          return;
        }
        
        payload = buildBusinessInsightPayload({
          userId: user.id,
          orgId,
          content,
          title,
        });
      }
      
      // Add published_at timestamp
      payload.published_at = new Date().toISOString();
      
      const {
        data: newPost,
        error
      } = await supabase.from('posts').insert(payload).select('id').single();
      if (error) {
        console.error('Error creating post:', error);
        if (error.message.includes('org_id')) {
          toast.error('You must be a member of an organization to create business insights');
        } else {
          toast.error(error.message || 'Failed to create post');
        }
        return;
      }

      // Create soft links if any posts were selected
      // Note: api_create_soft_links RPC should ensure relation_type='soft' on the server side
      if (selectedLinks.length > 0 && newPost?.id) {
        try {
          await supabase.rpc('api_create_soft_links', {
            p_parent: newPost.id,
            p_children: selectedLinks
          });
        } catch (linkError) {
          console.error('Error creating links:', linkError);
          toast.warning('Post created but some links failed');
        }
      }
      toast.success(`${isPublicMode ? 'Brainstorm' : 'Insight'} created successfully`);
      clearDraft();
      handleClose();
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error(error?.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCreateOpenIdea = async () => {
    if (!content.trim() || isSubmitting) return;
    if (content.length < 10 || content.length > 280) {
      toast.error('Open ideas must be between 10-280 characters');
      return;
    }
    setIsSubmitting(true);
    try {
      const {
        data,
        error: functionError
      } = await supabase.functions.invoke('submit-open-idea', {
        body: {
          content: content.trim(),
          email: null,
          notify_on_interaction: false,
          subscribe_newsletter: false
        }
      });
      if (functionError) throw functionError;
      if (!data?.success || !data?.id) {
        throw new Error('Failed to submit idea');
      }
      toast.success('Open idea created successfully');
      clearDraft();
      handleClose();
    } catch (error: any) {
      console.error('Error creating open idea:', error);
      toast.error(error?.message || 'Failed to create open idea');
    } finally {
      setIsSubmitting(false);
    }
  };
  const renderOpenIdeaForm = () => <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-5 h-5 text-[var(--accent)]" />
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">New Open Idea</h3>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="open-idea-content" className="text-[var(--text-primary)]">
          What question can't you stop thinking about?
        </Label>
        <GlassInput as="textarea" id="open-idea-content" placeholder="Share your question or idea..." value={content} onChange={e => setContent(e.target.value)} rows={5} maxLength={280} />
        <div className="flex justify-between text-xs text-[var(--text-secondary)]">
          <span>{content.length < 10 ? `${10 - content.length} more needed` : 'Perfect length'}</span>
          <span className={content.length > 250 ? 'text-red-400' : ''}>
            {content.length} / 280
          </span>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button className="glassButton glassButton--muted" onClick={() => setComposerMode('post')}>
          Back to {isPublicMode ? 'Brainstorm' : 'Insight'}
        </button>
        <button className="glassButton glassButton--accent" onClick={handleCreateOpenIdea} disabled={content.length < 10 || content.length > 280 || isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Open Idea'}
        </button>
      </div>
    </div>;
  const renderPublicForm = () => <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-5 h-5 text-[var(--accent)]" />
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Wanna share a Spark?   </h3>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="brainstorm-content" className="text-[var(--text-primary)]">Your spark of inspiration</Label>
        <GlassInput as="textarea" id="brainstorm-content" placeholder="Share your idea, thought, or insight..." value={content} onChange={e => setContent(e.target.value)} rows={6} maxLength={PUBLIC_MAX_CHARS} />
        <div className="flex justify-between text-xs text-[var(--text-secondary)]">
          <span>Required</span>
          <span className={content.length > PUBLIC_MAX_CHARS * 0.9 ? 'text-red-400' : ''}>
            {content.length} / {PUBLIC_MAX_CHARS}
          </span>
        </div>
      </div>

      {/* Link Selector Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-[var(--text-primary)]">Link to existing Sparks (optional)</Label>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowLinkSelector(!showLinkSelector)} className="text-xs">
            <Link2 className="w-3 h-3 mr-1" />
            {showLinkSelector ? 'Hide' : 'Show'} ({selectedLinks.length})
          </Button>
        </div>

        {showLinkSelector && <GlassSurface inset className="p-3 space-y-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-white/50" />
              <input type="text" value={linkSearch} onChange={e => setLinkSearch(e.target.value)} placeholder="Search Sparks..." className="w-full pl-8 pr-3 py-1.5 text-sm bg-white/10 border border-white/20 rounded text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
            </div>

            {/* Selected Links */}
            {selectedLinks.length > 0 && <div className="flex flex-wrap gap-1">
                {selectedLinks.map(id => {
            const post = availablePosts.find(p => p.id === id);
            return <Badge key={id} variant="secondary" className="text-xs gap-1">
                      {post?.title || 'Untitled'}
                      <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => toggleLink(id)} />
                    </Badge>;
          })}
              </div>}

            {/* Available Posts */}
            <ScrollArea className="h-[200px] rounded border border-white/10 bg-white/5">
              {loadingPosts ? <div className="p-3 text-center text-sm text-white/60">Loading...</div> : availablePosts.length === 0 ? <div className="p-3 text-center text-sm text-white/60">
                  {linkSearch ? 'No posts found' : 'No recent Sparks'}
                </div> : <div className="p-2 space-y-1">
                  {availablePosts.map(post => <button key={post.id} type="button" onClick={() => toggleLink(post.id)} className={`w-full text-left p-2 rounded text-sm transition-colors ${selectedLinks.includes(post.id) ? 'bg-[var(--accent)]/20 border border-[var(--accent)]/40' : 'hover:bg-white/10 border border-transparent'}`}>
                      <div className="font-medium text-white line-clamp-1">
                        {post.title || 'Untitled'}
                      </div>
                      <div className="text-xs text-white/60 line-clamp-1 mt-0.5">
                        {post.content}
                      </div>
                    </button>)}
                </div>}
            </ScrollArea>
          </GlassSurface>}
      </div>

      <div className="flex-row py-[5px] gap-0 flex items-center justify-center rounded-none">
        <div className="flex justify-end space-x-2">
          <button className="glassButton glassButton--muted" onClick={handleClose}>
            Cancel
          </button>
          <button className="glassButton glassButton--accent" onClick={handleCreate} disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Brainstorm'}
          </button>
        </div>
        <div className="flex justify-center">
          
        </div>
      </div>
    </div>;
  const renderBusinessForm = () => {
    if (!isBusinessMember()) {
      return <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">New Business Insight</h3>
        </div>
        
        <GlassSurface inset className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[var(--text-secondary)] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-[var(--text-primary)]">Business membership required</p>
            <p className="text-xs text-[var(--text-secondary)]">
              You need to be a member of an organization to create business insights.
            </p>
          </div>
        </GlassSurface>

        <div className="flex justify-end pt-2">
          <button className="glassButton glassButton--muted" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>;
    }
    return <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">New Business Insight</h3>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="insight-title" className="text-[var(--text-primary)]">Title (optional)</Label>
          <GlassInput id="insight-title" placeholder="Give your insight a title..." value={title} onChange={e => setTitle(e.target.value)} maxLength={200} />
          <div className="text-xs text-[var(--text-secondary)] text-right">
            {title.length} / 200
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="insight-content" className="text-[var(--text-primary)]">Content</Label>
          <GlassInput as="textarea" id="insight-content" placeholder="Share your professional insight, analysis, or findings..." value={content} onChange={e => setContent(e.target.value)} rows={6} maxLength={BUSINESS_MAX_CHARS} />
          <div className="flex justify-between text-xs text-[var(--text-secondary)]">
            <span>Required</span>
            <span className={content.length > BUSINESS_MAX_CHARS * 0.9 ? 'text-red-400' : ''}>
              {content.length} / {BUSINESS_MAX_CHARS}
            </span>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <button className="glassButton glassButton--muted" onClick={handleClose}>
            Cancel
          </button>
          <button className="glassButton glassButton--accent" onClick={handleCreate} disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Insight'}
          </button>
        </div>
      </div>;
  };
  return <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg border-0 bg-transparent backdrop-blur-none p-0 overflow-hidden shadow-none">
        <GlassSurface inset className="liquid-glass-composer p-6 border-0">
          <DialogHeader>
            <DialogTitle className="sr-only">
              {isPublicMode ? 'Create New Brainstorm' : 'Create New Business Insight'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {isPublicMode ? 'Share a spark of inspiration with the community' : 'Share professional knowledge with your organization'}
            </DialogDescription>
          </DialogHeader>

          {composerMode === 'open-idea' ? renderOpenIdeaForm() : isPublicMode ? renderPublicForm() : renderBusinessForm()}
        </GlassSurface>
      </DialogContent>
    </Dialog>;
}