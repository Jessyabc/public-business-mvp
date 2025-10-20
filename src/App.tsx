import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { AppModeProvider } from "@/contexts/AppModeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { BackgroundModeManager } from "@/components/layout/BackgroundModeManager";
import { ThemeInjector } from "@/styles/ThemeInjector";
import { router } from "./app/router";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { DeveloperPanel } from "@/components/dev/DeveloperPanel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AppModeProvider>
          <BackgroundModeManager />
          <ThemeInjector />
          <div className="page-shell">
            <main className="page-content">
              <RouterProvider router={router} />
            </main>
          </div>
          {process.env.NODE_ENV !== 'production' && <DeveloperPanel />}
        </AppModeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
