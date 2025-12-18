import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Brain, FileText, AlertCircle, Link2, X, Search } from "lucide-react";
import { useDiscussLensSafe } from "@/contexts/DiscussLensContext";
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from "@/hooks/useUserRoles";
import { useComposerStore } from "@/hooks/useComposerStore";
import { toast } from 'sonner';
import { useAuth } from "@/contexts/AuthContext";
import { sanitizeText } from "@/lib/sanitize";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { buildSparkPayload, buildBusinessInsightPayload } from "@/lib/posts";
import { BusinessInsightComposer } from "./BusinessInsightComposer";
import { ContinuationBanner } from "./ContinuationBanner";
import { usePendingReferencesStore } from "@/stores/pendingReferencesStore";
import { createHardLink, createSoftLinks } from "@/lib/posts/relations";
import { cn } from "@/lib/utils";

interface ComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PUBLIC_MAX_CHARS = 5000;
const BUSINESS_MAX_CHARS = 10000;

export function ComposerModal({ isOpen, onClose }: ComposerModalProps) {
  const { lens } = useDiscussLensSafe();
  const { user } = useAuth();
  const { isBusinessMember } = useUserRoles();
  const { setContext, context } = useComposerStore();
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
  
  const { pendingRefs, clearRefs } = usePendingReferencesStore();
  
  const isPublicMode = lens === 'public';
  const maxChars = isPublicMode ? PUBLIC_MAX_CHARS : BUSINESS_MAX_CHARS;
  const canSubmit = content.trim().length > 0 && content.length <= maxChars;
  
  // Check if we're in continuation mode
  const isContinuationMode = context?.relationType === 'continuation' && context?.parentPostId;
  const isFromOpenIdea = !!context?.originOpenIdeaId;

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
      const draft = { content, title };
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
      let query = supabase
        .from('posts')
        .select('id, title, content, created_at')
        .eq('type', 'brainstorm')
        .eq('kind', 'Spark')
        .eq('mode', 'public')
        .eq('visibility', 'public')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      if (linkSearch.trim()) {
        query = query.or(`title.ilike.%${linkSearch}%,content.ilike.%${linkSearch}%`);
      }

      const { data, error } = await query;
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
    setSelectedLinks(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId) 
        : [...prev, postId]
    );
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
        payload = buildSparkPayload({
          userId: user.id,
          content,
          title: undefined,
          metadata: context?.originOpenIdeaId 
            ? { origin_open_idea_id: context.originOpenIdeaId }
            : undefined,
        });
      } else {
        // Business Insight
        const { data: orgId, error: orgError } = await supabase.rpc('get_user_org_id');
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
      
      const { data: newPost, error } = await supabase
        .from('posts')
        .insert(payload)
        .select('id')
        .single();

      if (error) {
        console.error('Error creating post:', error);
        if (error.message.includes('org_id')) {
          toast.error('You must be a member of an organization to create business insights');
        } else {
          toast.error(error.message || 'Failed to create post');
        }
        return;
      }

      // Create hard link if continuing a spark
      if (isContinuationMode && context?.parentPostId && newPost?.id) {
        try {
          await createHardLink(context.parentPostId, newPost.id);
        } catch (linkError) {
          console.error('Error creating hard link:', linkError);
          toast.warning('Post created but continuation link failed');
        }
      }

      // Create soft links from pending references
      const allSoftLinks = [...selectedLinks, ...pendingRefs];
      if (allSoftLinks.length > 0 && newPost?.id) {
        try {
          await createSoftLinks(newPost.id, allSoftLinks);
          clearRefs(); // Clear pending refs after successful creation
        } catch (linkError) {
          console.error('Error creating soft links:', linkError);
          toast.warning('Post created but some links failed');
        }
      }

      // Create idea_link if sparked from open idea
      if (isFromOpenIdea && context?.originOpenIdeaId && newPost?.id) {
        try {
          await supabase.from('idea_links').insert({
            source_id: context.originOpenIdeaId,
            source_type: 'open_idea',
            target_id: newPost.id,
            target_type: 'spark',
            created_by: user.id
          });
        } catch (linkError) {
          console.error('Error creating idea link:', linkError);
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
    // Block authenticated users from creating open ideas
    if (user) {
      toast.error('Logged-in users should create Sparks instead of Open Ideas. Switch to the Brainstorm tab.');
      return;
    }
    
    if (!content.trim() || isSubmitting) return;
    
    // Sanitize and validate content
    const sanitizedContent = sanitizeText(content.trim());
    if (sanitizedContent.length < 10 || sanitizedContent.length > 500) {
      toast.error('Open ideas must be between 10-500 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error: functionError } = await supabase.functions.invoke('submit-open-idea', {
        body: {
          content: sanitizedContent,
          email: null,
          notify_on_interaction: false,
          subscribe_newsletter: false
        }
      });

      if (functionError) throw functionError;
      if (!data?.success || !data?.id) {
        throw new Error(data?.error || 'Failed to submit idea');
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

  const handleClearContext = () => {
    setContext(null);
  };

  const renderOpenIdeaForm = () => (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          "bg-[hsl(var(--accent))]/20 border border-[hsl(var(--accent))]/30"
        )}>
          <Brain className="w-5 h-5 text-[hsl(var(--accent))]" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">New Open Idea</h3>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="open-idea-content" className="text-foreground/80">
          What question can't you stop thinking about?
        </Label>
        <textarea
          id="open-idea-content"
          placeholder="Share your question or idea..."
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={5}
          maxLength={280}
          className={cn(
            "w-full rounded-xl px-4 py-3 resize-none",
            "bg-white/5 border border-white/10",
            "text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/50 focus:border-transparent",
            "transition-all duration-200"
          )}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{content.length < 10 ? `${10 - content.length} more needed` : 'Perfect length'}</span>
          <span className={content.length > 250 ? 'text-red-400' : ''}>
            {content.length} / 280
          </span>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button
          variant="ghost"
          onClick={() => setComposerMode('post')}
          className="text-muted-foreground hover:text-foreground"
        >
          Back to {isPublicMode ? 'Brainstorm' : 'Insight'}
        </Button>
        <Button
          onClick={handleCreateOpenIdea}
          disabled={content.length < 10 || content.length > 280 || isSubmitting}
          className={cn(
            "bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/90",
            "text-white font-medium",
            "shadow-[0_0_20px_rgba(72,159,227,0.3)]",
            "hover:shadow-[0_0_30px_rgba(72,159,227,0.5)]",
            "transition-all duration-300",
            "disabled:opacity-50 disabled:shadow-none"
          )}
        >
          {isSubmitting ? 'Creating...' : 'Create Open Idea'}
        </Button>
      </div>
    </div>
  );

  const renderPublicForm = () => (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          "bg-[hsl(var(--accent))]/20 border border-[hsl(var(--accent))]/30",
          "shadow-[0_0_15px_rgba(72,159,227,0.3)]"
        )}>
          <Brain className="w-5 h-5 text-[hsl(var(--accent))]" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          {isContinuationMode ? 'Continue this Spark' : 'Share a new Spark'}
        </h3>
      </div>
      
      {/* Context banners */}
      <ContinuationBanner 
        parentPostId={context?.parentPostId}
        originOpenIdeaId={context?.originOpenIdeaId}
        onClear={handleClearContext}
      />
      
      <div className="space-y-2">
        <Label htmlFor="brainstorm-content" className="text-foreground/80">
          Your spark of inspiration
        </Label>
        <textarea
          id="brainstorm-content"
          placeholder="Share your idea, thought, or insight..."
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={6}
          maxLength={PUBLIC_MAX_CHARS}
          className={cn(
            "w-full rounded-xl px-4 py-3 resize-none",
            "bg-white/5 border border-white/10",
            "text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/50 focus:border-transparent",
            "transition-all duration-200"
          )}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Required</span>
          <span className={content.length > PUBLIC_MAX_CHARS * 0.9 ? 'text-red-400' : ''}>
            {content.length} / {PUBLIC_MAX_CHARS}
          </span>
        </div>
      </div>

      {/* Link Selector Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-foreground/80">Link to existing Sparks (optional)</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowLinkSelector(!showLinkSelector)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <Link2 className="w-3 h-3 mr-1" />
            {showLinkSelector ? 'Hide' : 'Show'} ({selectedLinks.length})
          </Button>
        </div>

        {showLinkSelector && (
          <div className={cn(
            "p-3 space-y-3 rounded-xl",
            "bg-white/5 border border-white/10"
          )}>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={linkSearch}
                onChange={e => setLinkSearch(e.target.value)}
                placeholder="Search Sparks..."
                className={cn(
                  "w-full pl-9 pr-3 py-2 text-sm rounded-lg",
                  "bg-white/5 border border-white/10",
                  "text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent))]/50"
                )}
              />
            </div>

            {/* Selected Links */}
            {selectedLinks.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedLinks.map(id => {
                  const post = availablePosts.find(p => p.id === id);
                  return (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="text-xs gap-1 bg-[hsl(var(--accent))]/20 border-[hsl(var(--accent))]/30 text-[hsl(var(--accent))]"
                    >
                      {post?.title || 'Untitled'}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-400"
                        onClick={() => toggleLink(id)}
                      />
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Available Posts */}
            <ScrollArea className="h-[160px] rounded-lg border border-white/10 bg-white/5">
              {loadingPosts ? (
                <div className="p-3 text-center text-sm text-muted-foreground">Loading...</div>
              ) : availablePosts.length === 0 ? (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  {linkSearch ? 'No posts found' : 'No recent Sparks'}
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {availablePosts.map(post => (
                    <div
                      key={post.id}
                      onClick={() => toggleLink(post.id)}
                      className={cn(
                        "p-2 rounded-lg cursor-pointer transition-colors",
                        selectedLinks.includes(post.id)
                          ? "bg-[hsl(var(--accent))]/20 border border-[hsl(var(--accent))]/30"
                          : "hover:bg-white/10"
                      )}
                    >
                      <div className="text-sm font-medium line-clamp-1">
                        {post.title || 'Untitled'}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {post.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-2">
        {!user && (
          <Button
            variant="ghost"
            onClick={() => setComposerMode('open-idea')}
            className="text-muted-foreground hover:text-foreground"
          >
            Submit Open Idea Instead
          </Button>
        )}
        <div className="flex-1" />
        <Button
          onClick={handleCreate}
          disabled={!canSubmit || isSubmitting}
          className={cn(
            "bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/90",
            "text-white font-medium",
            "shadow-[0_0_20px_rgba(72,159,227,0.3)]",
            "hover:shadow-[0_0_30px_rgba(72,159,227,0.5)]",
            "transition-all duration-300",
            "disabled:opacity-50 disabled:shadow-none"
          )}
        >
          {isSubmitting ? 'Creating...' : 'Create Spark'}
        </Button>
      </div>
    </div>
  );

  // Business mode uses BusinessInsightComposer
  if (!isPublicMode) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-2xl bg-background/95 backdrop-blur-xl border-white/10">
          <DialogHeader>
            <DialogTitle className="sr-only">Create Business Insight</DialogTitle>
            <DialogDescription className="sr-only">
              Create a new business insight to share with your organization
            </DialogDescription>
          </DialogHeader>
          <BusinessInsightComposer 
            onClose={handleClose}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-xl bg-background/95 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="sr-only">
            {composerMode === 'open-idea' ? 'Create Open Idea' : 'Create Spark'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {composerMode === 'open-idea' 
              ? 'Share a question or idea with the community'
              : 'Share your thoughts and insights'
            }
          </DialogDescription>
        </DialogHeader>
        {composerMode === 'open-idea' ? renderOpenIdeaForm() : renderPublicForm()}
      </DialogContent>
    </Dialog>
  );
}
