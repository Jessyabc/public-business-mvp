import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type OpenIdea } from '@/hooks/useOpenIdeas';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PostCardModalProps {
  openIdea: OpenIdea | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PostCardModal({ openIdea, isOpen, onClose }: PostCardModalProps) {
  if (!openIdea) return null;

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
        </div>
      </DialogContent>
    </Dialog>
  );
}

