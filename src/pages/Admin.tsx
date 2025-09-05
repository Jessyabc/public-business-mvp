import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/ui/components/GlassCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Lightbulb, Settings } from "lucide-react";

interface OpenIdea {
  id: string;
  content: string;
  is_curated: boolean;
  linked_brainstorms_count: number;
  created_at: string;
}

export function Admin() {
  const [ideas, setIdeas] = useState<OpenIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      fetchIdeas();
    }
  }, [isAuthenticated]);

  const fetchIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from("open_ideas")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setIdeas(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch ideas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCurated = async (ideaId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("open_ideas")
        .update({ is_curated: !currentStatus })
        .eq("id", ideaId);

      if (error) throw error;

      setIdeas(ideas.map(idea => 
        idea.id === ideaId 
          ? { ...idea, is_curated: !currentStatus }
          : idea
      ));

      toast({
        title: "Success",
        description: `Idea ${!currentStatus ? "added to" : "removed from"} curated feed.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update idea.",
        variant: "destructive",
      });
    }
  };

  const handleLogin = () => {
    // Simple password check - in production, use proper authentication
    if (password === "admin123") {
      setIsAuthenticated(true);
      toast({
        title: "Welcome",
        description: "Admin access granted.",
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid password.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>

        <GlassCard className="max-w-md w-full glass-card glass-content" padding="lg">
          <div className="text-center mb-6">
            <Settings className="w-16 h-16 text-pb-blue mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-pb-text0">Admin Access</h1>
            <p className="text-pb-text2">Enter password to manage curated ideas</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl glass-input border border-pb-blue/20 bg-transparent text-pb-text0 placeholder:text-pb-text2"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button
              onClick={handleLogin}
              className="w-full glass-button bg-pb-blue/20 hover:bg-pb-blue/30 text-pb-blue border border-pb-blue/30 h-12 text-lg font-medium rounded-xl interactive-glass"
            >
              Access Admin Panel
            </Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-6xl mx-auto pt-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Admin Panel</h1>
          <p className="text-muted-foreground">Manage curated ideas for the homepage</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Lightbulb className="w-16 h-16 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">Loading ideas...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {ideas.map((idea) => (
              <GlassCard
                key={idea.id}
                className="border-primary/20 glass-ios-triple glass-corner-distort"
                padding="lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-foreground leading-relaxed mb-4">
                      {idea.content}
                    </p>
                    <div className="text-sm text-muted-foreground">
                      {idea.linked_brainstorms_count} brainstorms • 
                      Created {new Date(idea.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${idea.is_curated ? 'text-primary' : 'text-muted-foreground'}`}>
                      {idea.is_curated ? 'Curated' : 'Not Curated'}
                    </span>
                    <Switch
                      checked={idea.is_curated}
                      onCheckedChange={() => toggleCurated(idea.id, idea.is_curated)}
                    />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;