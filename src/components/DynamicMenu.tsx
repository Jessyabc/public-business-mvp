import { Input } from "@/components/ui/input";
import { GlassCard } from "@/ui/components/GlassCard";

export default function DynamicMenu() {
  return (
    <div className="fixed bottom-6 left-6 right-6 z-50">
      <GlassCard className="glass-ios-triple glass-corner-distort border-0 max-w-screen-xl mx-auto">
        <Input
          placeholder="Ready to share a Brainstorm?"
          className="rounded-full bg-white/10 border-white/20 text-foreground placeholder:text-foreground/60 focus:ring-primary/50 focus:border-primary/50 focus:bg-white/20 transition-all duration-300 h-12 px-6"
        />
      </GlassCard>
    </div>
  );
}