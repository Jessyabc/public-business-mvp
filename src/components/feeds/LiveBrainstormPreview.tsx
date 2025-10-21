import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Network, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAppMode } from '@/contexts/AppModeContext';
import { usePosts } from '@/hooks/usePosts';

interface LiveBrainstormPreviewProps {
  onExplore: () => void;
}

export function LiveBrainstormPreview({ onExplore }: LiveBrainstormPreviewProps) {
  const navigate = useNavigate();
  const { setMode } = useAppMode();
  const { posts, loading } = usePosts();
  
  // Filter for top brainstorm posts
  const brainstorms = posts
    .filter(p => p.mode === 'public')
    .sort((a, b) => (b.t_score || 0) - (a.t_score || 0))
    .slice(0, 6);

  const handleBrainstormClick = (brainstormId: string) => {
    // Smooth transition: switch to public mode and navigate to brainstorm
    setMode('public');
    setTimeout(() => {
      navigate(`/?id=${brainstormId}`);
    }, 150);
  };

  if (loading) {
    return (
      <Card className="glass-card border-0 elevation-16 glass-low">
        <CardContent className="p-8 text-center">
          <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary/50 animate-pulse" />
          <p className="text-muted-foreground">Loading brainstorm network...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-0 elevation-16 glass-low">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-2">
          <Network className="w-6 h-6 text-primary" />
          <CardTitle className="text-2xl">Live Brainstorm Window</CardTitle>
        </div>
        <CardDescription className="text-base">
          Real-time feed of top brainstorms from the public network
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Scrollable Preview Window */}
        <div className="relative mb-6 border border-border/50 rounded-xl overflow-hidden">
          <div className="flex overflow-x-auto gap-4 p-4 snap-x snap-mandatory scrollbar-hide">
            {brainstorms.length === 0 ? (
              <div className="min-w-[300px] p-6 text-center">
                <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No brainstorms yet. Be the first!</p>
              </div>
            ) : (
              brainstorms.map((brainstorm) => (
                <div
                  key={brainstorm.id}
                  onClick={() => handleBrainstormClick(brainstorm.id)}
                  className="min-w-[280px] max-w-[280px] snap-center cursor-pointer group"
                >
                  <div className="glass-low p-4 rounded-lg border border-border/40 h-full transition-all duration-300 hover:border-primary/40 hover:shadow-lg">
                    <div className="flex items-start justify-between mb-3">
                      <Brain className="w-5 h-5 text-primary shrink-0" />
                      {brainstorm.t_score && (
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                          T: {brainstorm.t_score}
                        </span>
                      )}
                    </div>
                    
                    {brainstorm.title && (
                      <h4 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {brainstorm.title}
                      </h4>
                    )}
                    
                    <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                      {brainstorm.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatDistanceToNow(new Date(brainstorm.created_at), { addSuffix: true })}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Stats and CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Brain className="w-4 h-4" />
              {brainstorms.length} Active Ideas
            </span>
            <span className="flex items-center gap-1">
              <Network className="w-4 h-4" />
              Live Network
            </span>
          </div>
          
          <Button onClick={onExplore} className="bg-primary hover:bg-primary/90">
            Explore Full Network
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
