import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Brainstorm } from "@/types/brainstorm";
import BrainstormCard from "./BrainstormCard";
import { ArrowRight, Sparkles } from "lucide-react";

interface ConnectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sourceBrainstorm: Brainstorm | null;
  connectedBrainstorms: Brainstorm[];
}

export default function ConnectionDialog({
  isOpen,
  onClose,
  sourceBrainstorm,
  connectedBrainstorms,
}: ConnectionDialogProps) {
  if (!sourceBrainstorm) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass border-white/20 max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-light text-foreground/90">
            <Sparkles className="w-5 h-5 text-primary" />
            Idea Connections
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-6">
          <div>
            <h3 className="text-sm font-medium text-foreground/70 mb-3 uppercase tracking-wide">
              Source Spark
            </h3>
            <BrainstormCard brainstorm={sourceBrainstorm} showConnections={false} />
          </div>
          
          {connectedBrainstorms.length > 0 && (
            <>
              <div className="flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-primary/60" />
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-foreground/70 mb-3 uppercase tracking-wide">
                  Sparked Ideas ({connectedBrainstorms.length})
                </h3>
                <div className="space-y-4">
                  {connectedBrainstorms.map((brainstorm) => (
                    <BrainstormCard 
                      key={brainstorm.id} 
                      brainstorm={brainstorm} 
                      showConnections={false}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}