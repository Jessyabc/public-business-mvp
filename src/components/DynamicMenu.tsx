import { Input } from "@/components/ui/input";

export default function DynamicMenu() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4">
      <div className="max-w-screen-xl mx-auto">
        <Input
          placeholder="Ready to share a Brainstorm?"
          className="rounded-full bg-muted border-muted-foreground/20 focus:ring-primary/50 focus:border-primary transition-all duration-200"
        />
      </div>
    </div>
  );
}