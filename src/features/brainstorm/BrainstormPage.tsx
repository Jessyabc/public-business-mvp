// src/features/brainstorm/BrainstormPage.tsx
import { useSearchParams } from "react-router-dom";
import SpaceCanvas from "./components/SpaceCanvas";
import { RightSidebar } from "@/components/sidebar"; // adjust if your path differs

export default function BrainstormPage() {
  const [params] = useSearchParams();
  const startId = params.get("id") || undefined;

  return (
    <div className="brainstorm-canvas relative">
      {/* Deep PB-blue canvas: wheel = hard chain, soft links rail */}
      <SpaceCanvas startId={startId} />

      {/* Right sidebar overlay is handled by the RightSidebar component itself */}
      <RightSidebar />
    </div>
  );
}
