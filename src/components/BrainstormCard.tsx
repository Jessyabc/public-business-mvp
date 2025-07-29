import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brainstorm } from "@/types/brainstorm";
import { Brain, MessageCircle, Clock, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface BrainstormCardProps {
  brainstorm: Brainstorm;
  onConnect?: (brainstormId: string) => void;
  showConnections?: boolean;
}

export default function BrainstormCard({ 
  brainstorm, 
  onConnect,
  showConnections = true 
}: BrainstormCardProps) {
  const handleConnectClick = () => {
    if (onConnect) {
      onConnect(brainstorm.id);
    }
  };

  const getBrainScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (score >= 70) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    return "bg-purple-500/20 text-purple-400 border-purple-500/30";
  };

  return (
    <Card className="glass-card hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 border-0 group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 text-xs text-foreground/60">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(brainstorm.timestamp, { addSuffix: true })}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-xs ${getBrainScoreColor(brainstorm.brainScore)}`}>
              <Brain className="w-3 h-3 mr-1" />
              {brainstorm.brainScore}
            </Badge>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
              <MessageCircle className="w-3 h-3 mr-1" />
              {brainstorm.threadCount}
            </Badge>
          </div>
        </div>
        
        <p className="text-foreground/90 text-base leading-relaxed font-medium mb-4">
          {brainstorm.content}
        </p>
        
        {showConnections && brainstorm.connectedIds.length > 0 && (
          <div className="border-t border-white/10 pt-4">
            <button
              onClick={handleConnectClick}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium group-hover:animate-pulse"
            >
              <Zap className="w-4 h-4" />
              View {brainstorm.connectedIds.length} connected spark{brainstorm.connectedIds.length !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}