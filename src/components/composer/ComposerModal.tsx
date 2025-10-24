import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassSurface } from "@/components/ui/GlassSurface";
import { Label } from "@/components/ui/label";
import { Brain, FileText, AlertCircle } from "lucide-react";
import { useAppMode } from "@/contexts/AppModeContext";
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from "@/hooks/useUserRoles";
import { useComposerStore } from "@/hooks/useComposerStore";
import { toast } from 'sonner';
import { useAuth } from "@/contexts/AuthContext";

interface ComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PUBLIC_MAX_CHARS = 5000;
const BUSINESS_MAX_CHARS = 10000;

export function ComposerModal({ isOpen, onClose }: ComposerModalProps) {
  const { mode } = useAppMode();
  const { user } = useAuth();
  const { isBusinessMember } = useUserRoles();
  const { setContext } = useComposerStore();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const draft = { content, title };
      localStorage.setItem(draftKey, JSON.stringify(draft));
    }
  }, [content, title, isOpen, isPublicMode]);

  const handleClose = () => {
    setContent("");
    setTitle("");
    setContext(null);
    onClose();
  };

  const clearDraft = () => {
    const draftKey = isPublicMode ? 'composer:brainstorm' : 'composer:insight';
    localStorage.removeItem(draftKey);
  };

  const handleCreate = async () => {
    if (!canSubmit || isSubmitting) return;

    // Business mode validation
    if (!isPublicMode && !isBusinessMember()) {
      toast.error('Business membership required');
      return;
    }

    setIsSubmitting(true);
    try {
      const insertData: any = {
        user_id: user?.id,
        content: content.trim(),
        published_at: new Date().toISOString(),
      };

      if (isPublicMode) {
        // Public brainstorm
        insertData.type = 'brainstorm';
        insertData.visibility = 'public';
        insertData.mode = 'public';
        insertData.org_id = null;
      } else {
        // Business insight - org_id will be determined by RLS/backend
        insertData.type = 'business_insight';
        insertData.visibility = 'org_public';
        insertData.mode = 'business';
        // Get the user's org_id from their membership
        const { data: orgId, error: orgError } = await supabase.rpc('get_user_org_id');
        
        if (orgError || !orgId) {
          toast.error('You must be a member of an organization to create business insights');
          setIsSubmitting(false);
          return;
        }
        
        insertData.org_id = orgId;

        if (title.trim()) {
          insertData.title = title.trim();
        }
      }

      const { error } = await supabase
        .from('posts')
        .insert(insertData);

      if (error) {
        console.error('Error creating post:', error);
        if (error.message.includes('org_id')) {
          toast.error('You must be a member of an organization to create business insights');
        } else {
          toast.error(error.message || 'Failed to create post');
        }
        return;
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

  const renderPublicForm = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-5 h-5 text-[var(--accent)]" />
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">New Brainstorm</h3>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="brainstorm-content" className="text-[var(--text-primary)]">Your spark of inspiration</Label>
        <GlassInput
          as="textarea"
          id="brainstorm-content"
          placeholder="Share your idea, thought, or insight..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          maxLength={PUBLIC_MAX_CHARS}
        />
        <div className="flex justify-between text-xs text-[var(--text-secondary)]">
          <span>Required</span>
          <span className={content.length > PUBLIC_MAX_CHARS * 0.9 ? 'text-red-400' : ''}>
            {content.length} / {PUBLIC_MAX_CHARS}
          </span>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <button className="glassButton glassButton--muted" onClick={handleClose}>
          Cancel
        </button>
        <button 
          className="glassButton glassButton--accent" 
          onClick={handleCreate} 
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Brainstorm'}
        </button>
      </div>
    </div>
  );

  const renderBusinessForm = () => {
    if (!isBusinessMember()) {
    return (
      <div className="space-y-4">
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
      </div>
    );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">New Business Insight</h3>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="insight-title" className="text-[var(--text-primary)]">Title (optional)</Label>
          <GlassInput
            id="insight-title"
            placeholder="Give your insight a title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />
          <div className="text-xs text-[var(--text-secondary)] text-right">
            {title.length} / 200
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="insight-content" className="text-[var(--text-primary)]">Content</Label>
          <GlassInput
            as="textarea"
            id="insight-content"
            placeholder="Share your professional insight, analysis, or findings..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            maxLength={BUSINESS_MAX_CHARS}
          />
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
          <button 
            className="glassButton glassButton--accent" 
            onClick={handleCreate} 
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Insight'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg border-[var(--glass-border)] bg-transparent backdrop-blur-none p-0">
        <GlassSurface inset>
          <DialogHeader>
            <DialogTitle className="sr-only">
              {isPublicMode ? 'Create New Brainstorm' : 'Create New Business Insight'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {isPublicMode 
                ? 'Share a spark of inspiration with the community'
                : 'Share professional knowledge with your organization'
              }
            </DialogDescription>
          </DialogHeader>

          {isPublicMode ? renderPublicForm() : renderBusinessForm()}
        </GlassSurface>
      </DialogContent>
    </Dialog>
  );
}
