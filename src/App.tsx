import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { AppModeProvider } from "@/contexts/AppModeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { BackgroundModeManager } from "@/components/layout/BackgroundModeManager";
import { router } from "./app/router";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AppModeProvider>
          <BackgroundModeManager />
          <RouterProvider router={router} />
        </AppModeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
