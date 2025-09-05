import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { GlassCard } from "@/ui/components/GlassCard";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>

      <GlassCard className="text-center max-w-md glass-card glass-content" padding="lg">
        <h1 className="text-4xl font-bold mb-4 text-foreground">404</h1>
        <p className="text-xl text-muted-foreground mb-6">Oops! Page not found</p>
        <Button
          onClick={() => window.location.href = '/'}
          className="glass-button bg-pb-blue/20 hover:bg-pb-blue/30 text-pb-blue border border-pb-blue/30 interactive-glass"
        >
          Return to Home
        </Button>
      </GlassCard>
    </div>
  );
};

export default NotFound;
