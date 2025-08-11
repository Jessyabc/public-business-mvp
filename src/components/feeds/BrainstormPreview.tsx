import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, MessageCircle, ArrowRight, Sparkles, Network } from "lucide-react";

interface BrainstormPreviewProps {
  onExplore: () => void;
}

export function BrainstormPreview({ onExplore }: BrainstormPreviewProps) {
  const mockBrainstorms = [
    {
      id: 1,
      type: 'Spark',
      title: 'Quantum Computing Revolution',
      content: 'What if quantum computing could revolutionize how we approach climate modeling and prediction?',
      score: 94,
      connections: 7,
      tags: ['Technology', 'Climate'],
      position: { x: 0, y: 0 }
    },
    {
      id: 2,
      type: 'Threadline',
      title: 'Sustainable Supply Chains',
      content: 'Building transparent supply chains using blockchain technology for better accountability.',
      score: 87,
      connections: 12,
      tags: ['Blockchain', 'Sustainability'],
      position: { x: 300, y: -100 }
    },
    {
      id: 3,
      type: 'Echo Note',
      title: 'Remote Work Evolution',
      content: 'The future of work is hybrid - how do we balance productivity with human connection?',
      score: 76,
      connections: 9,
      tags: ['Future Work', 'Productivity'],
      position: { x: -250, y: 150 }
    }
  ];

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
          
          {/* Brainstorm Cards */}
          {mockBrainstorms.map((item, index) => (
            <div
              key={item.id}
              className={`absolute w-48 p-3 rounded-lg border backdrop-blur-sm hover:scale-105 transition-all duration-300 cursor-pointer ${getCardStyle(item.type)}`}
              style={{
                left: index === 0 ? '20%' : index === 1 ? '65%' : '10%',
                top: index === 0 ? '25%' : index === 1 ? '15%' : '65%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className={`text-xs ${getTypeColor(item.type)}`}>
                  {item.type}
                </Badge>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    <Brain className="w-3 h-3 mr-1" />
                    {item.score}
                  </Badge>
                </div>
              </div>
              
              {/* Content */}
              <h4 className="font-semibold text-sm text-foreground mb-2 leading-tight">
                {item.title}
              </h4>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {item.content}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-2">
                {item.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="text-xs px-1.5 py-0.5 bg-background/50 rounded text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Connections */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageCircle className="w-3 h-3" />
                {item.connections}
              </div>
            </div>
          ))}
          
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
              500+ Active Brainstorms
            </span>
            <span className="flex items-center gap-1">
              <Network className="w-4 h-4" />
              1.2k Connections
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