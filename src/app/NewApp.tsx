import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { router } from "./router";
import { ComposerModal } from "@/components/composer/ComposerModal";
import { useComposerStore } from "@/hooks/useComposerStore";

const queryClient = new QueryClient();

function AppContent() {
  const { isOpen } = useComposerStore();

  return (
    <>
      <RouterProvider router={router} />
      {isOpen && <ComposerModal isOpen={isOpen} onClose={() => {}} />}
    </>
  );
}

const NewApp = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default NewApp;