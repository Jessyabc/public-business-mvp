import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, MessageCircle, ArrowRight, Sparkles, Network } from "lucide-react";

interface BrainstormPreviewProps {
  onExplore: () => void;
}

export function BrainstormPreview({ onExplore }: BrainstormPreviewProps) {
  // Mock data removed - component now shows network visualization without specific posts
  // Real brainstorms will be shown in the actual brainstorm network view

  const getCardStyle = (type: string) => {
    switch (type) {
      case 'Spark':
        return 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20';
      case 'Threadline':
        return 'bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20';
      case 'Echo Note':
        return 'bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20';
      default:
        return 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Spark':
        return 'text-primary';
      case 'Threadline':
        return 'text-blue-600';
      case 'Echo Note':
        return 'text-purple-600';
      default:
        return 'text-primary';
    }
  };

  return (
    <Card className="glass-card border-0 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-2">
          <Network className="w-6 h-6 text-primary" />
          <CardTitle className="text-2xl">Brainstorm Network</CardTitle>
        </div>
        <CardDescription className="text-base">
          Explore the interconnected web of ideas where thoughts spark new innovations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Mock Network Visualization */}
        <div className="relative h-80 mb-6 bg-gradient-to-br from-background to-muted/20 rounded-xl overflow-hidden border border-border/50">
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* Connection lines between cards */}
            <line 
              x1="25%" y1="30%" x2="70%" y2="20%" 
              stroke="hsl(var(--primary))" 
              strokeWidth="2" 
              strokeOpacity="0.6"
              filter="url(#glow)"
              className="animate-pulse"
            />
            <line 
              x1="25%" y1="30%" x2="15%" y2="70%" 
              stroke="#3B82F6" 
              strokeWidth="2" 
              strokeOpacity="0.6"
              filter="url(#glow)"
            />
            <line 
              x1="70%" y1="20%" x2="15%" y2="70%" 
              stroke="#8B5CF6" 
              strokeWidth="1.5" 
              strokeOpacity="0.4"
              strokeDasharray="5,5"
            />
          </svg>
          
          {/* Sample Network Nodes */}
          <div className="absolute w-48 p-3 rounded-lg border backdrop-blur-sm bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20" 
               style={{ left: '20%', top: '25%', transform: 'translate(-50%, -50%)' }}>
            <Badge variant="secondary" className="text-xs text-primary">Spark</Badge>
            <h4 className="font-semibold text-sm text-foreground mb-2 mt-2 leading-tight">
              Your Ideas Here
            </h4>
            <p className="text-xs text-muted-foreground">
              Start brainstorming to see your network grow...
            </p>
          </div>

          <div className="absolute w-48 p-3 rounded-lg border backdrop-blur-sm bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20"
               style={{ left: '65%', top: '15%', transform: 'translate(-50%, -50%)' }}>
            <Badge variant="secondary" className="text-xs text-blue-600">Thread</Badge>
            <h4 className="font-semibold text-sm text-foreground mb-2 mt-2 leading-tight">
              Connected Thoughts
            </h4>
            <p className="text-xs text-muted-foreground">
              Ideas linking together naturally...
            </p>
          </div>

          <div className="absolute w-48 p-3 rounded-lg border backdrop-blur-sm bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20"
               style={{ left: '10%', top: '65%', transform: 'translate(-50%, -50%)' }}>
            <Badge variant="secondary" className="text-xs text-purple-600">Echo</Badge>
            <h4 className="font-semibold text-sm text-foreground mb-2 mt-2 leading-tight">
              Building Momentum
            </h4>
            <p className="text-xs text-muted-foreground">
              Ideas that resonate and grow...
            </p>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute top-4 right-4">
            <Sparkles className="w-5 h-5 text-primary/60 animate-pulse" />
          </div>
          <div className="absolute bottom-6 left-6">
            <div className="w-2 h-2 bg-primary/40 rounded-full animate-pulse" />
          </div>
          <div className="absolute bottom-12 right-12">
            <div className="w-1.5 h-1.5 bg-blue-500/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
        
        {/* Stats and CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Brain className="w-4 h-4" />
              Ready for Your Ideas
            </span>
            <span className="flex items-center gap-1">
              <Network className="w-4 h-4" />
              Start Connecting
            </span>
          </div>
          
          <Button onClick={onExplore} className="bg-primary hover:bg-primary/90">
            Explore Network
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}