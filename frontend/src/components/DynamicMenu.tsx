import { GlassInput } from "@/components/ui/GlassInput";
import { GlassSurface } from "@/components/ui/GlassSurface";

export default function DynamicMenu() {
  return (
    <div className="fixed bottom-6 left-6 right-6 z-30">
      <GlassSurface className="max-w-screen-xl mx-auto">
        <GlassInput
          placeholder="Ready to share a Brainstorm?"
          className="rounded-full h-12 px-6"
        />
      </GlassSurface>
    </div>
  );
}