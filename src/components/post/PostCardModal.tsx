import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type OpenIdea } from '@/hooks/useOpenIdeas';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComposerStore } from '@/hooks/useComposerStore';

interface PostCardModalProps {
  openIdea: OpenIdea | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PostCardModal({ openIdea, isOpen, onClose }: PostCardModalProps) {
  const { openComposer } = useComposerStore();

  if (!openIdea) return null;

  const handleContinueAsSpark = () => {
    // Ensure we're in public mode (the composer will handle mode, but we want to set the draft correctly)
    const draftKey = 'composer:brainstorm';
    const draft = {
      content: openIdea.text || '',
      title: ''
    };
    
    // Save draft to localStorage
    localStorage.setItem(draftKey, JSON.stringify(draft));
    
    // Open the composer with origin open idea ID
    openComposer({
      originOpenIdeaId: openIdea.id,
    });
    
    // Close the idea modal
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Open Idea</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/90 whitespace-pre-wrap">
              {openIdea.text}
            </p>
          </div>
          
          <div className="flex items-center justify-between text-xs text-white/60">
            <div className="space-y-1">
              {openIdea.status && (
                <div>
                  <span className="font-medium">Status: </span>
                  <span className="capitalize">{openIdea.status}</span>
                </div>
              )}
              {openIdea.user_id && (
                <div>
                  <span className="font-medium">User ID: </span>
                  <span>{openIdea.user_id}</span>
                </div>
              )}
            </div>
            {openIdea.created_at && (
              <div>
                <span className="font-medium">Created: </span>
                <span>{new Date(openIdea.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Continue as Spark Button */}
          <div className="mt-6 flex justify-end">
            <Button
              type="button"
              onClick={handleContinueAsSpark}
              className="rounded-full px-4 py-2 text-sm font-medium bg-white text-slate-900 hover:bg-slate-100 transition"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Continue as Spark
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

