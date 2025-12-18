import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { router } from "./app/router";
import { DeveloperPanel } from "@/components/dev/DeveloperPanel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <div className="page-shell">
          <main className="page-content">
            <RouterProvider router={router} />
          </main>
        </div>
        {import.meta.env.DEV && <DeveloperPanel />}
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
