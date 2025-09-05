import { useAuth } from "@/contexts/AuthContext";
import { NewLanding } from "./NewLanding";

export function Landing() {
  const { user } = useAuth();
  
  // For now, always show the new landing page to test
  // Later you can add logic here to show old vs new
  return <NewLanding />;
}