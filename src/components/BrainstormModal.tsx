import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/ui/components/GlassCard";
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
      <DialogContent className="max-w-2xl glass-ios-triple glass-corner-distort border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {brainstorm.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{brainstorm.author_display_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatDistanceToNow(new Date(brainstorm.created_at))} ago</span>
            </div>
          </div>
          
          <GlassCard className="glass-ios-triple" padding="lg">
            <p className="text-foreground leading-relaxed">
              {brainstorm.content}
            </p>
          </GlassCard>
          
          <div className="flex gap-3">
            <Button 
              disabled 
              className="flex-1 glass-ios-triple bg-primary/10 text-primary border-primary/30 opacity-50"
            >
              Continue this Brainstorm
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="glass-ios-triple border-primary/30 text-foreground hover:bg-primary/10"
            >
              Close
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Sign up to continue brainstorming and connect with the community
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}