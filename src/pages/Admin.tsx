import { useState, useEffect } from "react";
import { GlassCard } from "@/ui/components/GlassCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Lightbulb, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin: checkAdmin, loading: rolesLoading } = useUserRoles();
  const navigate = useNavigate();

  const isAdminUser = checkAdmin();
  const loading = authLoading || rolesLoading;

  useEffect(() => {
    if (!loading && user && isAdminUser) {
      fetchIdeas();
    }
  }, [loading, user, isAdminUser]);

  const fetchIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from("open_ideas_legacy")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setIdeas(data || []);
    } catch (error: unknown) {
      console.error('Failed to fetch ideas', error);
      let description = 'Failed to fetch ideas.';
      if (error instanceof Error) {
        description = error.message;
      } else if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        description = (error as { message: string }).message;
      }
      toast({
        title: "Error",
        description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCurated = async (ideaId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("open_ideas_legacy")
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
    } catch (error: unknown) {
      console.error('Failed to update idea', error);
      let description = 'Failed to update idea.';
      if (error instanceof Error) {
        description = error.message;
      } else if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        description = (error as { message: string }).message;
      }
      toast({
        title: "Error",
        description,
        variant: "destructive",
      });
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  // Require authentication
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>

        <GlassCard className="max-w-md w-full glass-card glass-content" padding="lg">
          <div className="text-center mb-6">
            <Lock className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground">Authentication Required</h1>
            <p className="text-muted-foreground">Please sign in to access the admin panel</p>
          </div>
          
          <Button
            onClick={() => navigate('/auth')}
            className="w-full"
          >
            Sign In
          </Button>
        </GlassCard>
      </div>
    );
  }

  // Require admin role
  if (!isAdminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-destructive/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-destructive/10 rounded-full blur-3xl"></div>

        <GlassCard className="max-w-md w-full glass-card glass-content" padding="lg">
          <div className="text-center mb-6">
            <Lock className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access this page</p>
          </div>
          
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full"
          >
            Return Home
          </Button>
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