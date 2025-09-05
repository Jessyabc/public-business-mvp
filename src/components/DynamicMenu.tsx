import { Input } from "@/components/ui/input";
import { GlassCard } from "@/ui/components/GlassCard";

export default function DynamicMenu() {
  return (
    <div className="fixed bottom-6 left-6 right-6 z-50">
      <GlassCard className="glass-card border-0 max-w-screen-xl mx-auto">
        <Input
          placeholder="Ready to share a Brainstorm?"
          className="rounded-full bg-white/10 border-white/20 text-pb-text0 placeholder:text-pb-text2 focus:ring-pb-blue/50 focus:border-pb-blue/50 focus:bg-white/20 focus-glass transition-all duration-med h-12 px-6"
        />
      </GlassCard>
    </div>
  );
}