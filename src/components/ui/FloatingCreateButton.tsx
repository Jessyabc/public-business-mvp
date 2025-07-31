import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ComposerModal } from "@/components/composer/ComposerModal";
import { useAppMode } from "@/contexts/AppModeContext";

export function FloatingCreateButton() {
  const { mode } = useAppMode();
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsComposerOpen(true)}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full glass-card backdrop-blur-xl transition-all duration-300 hover:scale-110 z-40 border ${
          mode === 'public'
            ? 'bg-primary/20 hover:bg-primary/30 text-primary border-primary/30'
            : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 border-blue-500/30'
        }`}
        size="icon"
      >
        <Plus className="w-6 h-6" />
      </Button>

      <ComposerModal 
        isOpen={isComposerOpen} 
        onClose={() => setIsComposerOpen(false)} 
      />
    </>
  );
}