import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GlassSurface } from "@/components/ui/GlassSurface";
import { formatDistanceToNow } from "date-fns";
import { User, Clock, ArrowRight } from "lucide-react";
import { IdeaBrainstorm } from "@/hooks/useOpenIdeas";

interface BrainstormModalProps {
  brainstorm: IdeaBrainstorm | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BrainstormModal({ brainstorm, isOpen, onClose }: BrainstormModalProps) {
  if (!brainstorm) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-[var(--glass-border)] bg-transparent backdrop-blur-none p-0">
        <GlassSurface>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[var(--text-primary)]">
              {brainstorm.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{brainstorm.author_display_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatDistanceToNow(new Date(brainstorm.created_at))} ago</span>
              </div>
            </div>
            
            <GlassSurface inset>
              <p className="text-[var(--text-primary)] leading-relaxed">
                {brainstorm.content}
              </p>
            </GlassSurface>
            
            <div className="flex gap-3">
              <button 
                disabled 
                className="flex-1 glassButton glassButton--accent opacity-50 cursor-not-allowed flex items-center justify-center"
              >
                Continue this Brainstorm
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
              <button 
                onClick={onClose}
                className="glassButton glassButton--muted"
              >
                Close
              </button>
            </div>
            
            <p className="text-xs text-[var(--text-secondary)] text-center">
              Sign up to continue brainstorming and connect with the community
            </p>
          </div>
        </GlassSurface>
      </DialogContent>
    </Dialog>
  );
}