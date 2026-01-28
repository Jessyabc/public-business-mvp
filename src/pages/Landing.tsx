import { lazy, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Lazy load NewLanding to avoid duplicate bundling with Index.tsx
const NewLanding = lazy(() => import("./NewLanding").then(m => ({ default: m.NewLanding })));

export function Landing() {
  const { user } = useAuth();
  
  // For now, always show the new landing page to test
  // Later you can add logic here to show old vs new
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <NewLanding />
    </Suspense>
  );
}

// Default export for lazy loading
export default Landing;