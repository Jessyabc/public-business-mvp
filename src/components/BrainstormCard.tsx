import { formatDistanceToNow } from "date-fns";
import { User, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IdeaBrainstorm {
  id: string;
  title: string;
  content: string;
  author_display_name: string;
  created_at: string;
  idea_id: string;
}

interface BrainstormCardProps {
  brainstorm: IdeaBrainstorm;
  onClick?: () => void;
  showFreeBadge?: boolean;
}

export function BrainstormCard({ brainstorm, onClick, showFreeBadge }: BrainstormCardProps) {
  return (
    <Card 
      className="glass-business-card cursor-pointer hover:scale-105 transition-all duration-300 border-primary/20 relative"
      onClick={onClick}
    >
      {showFreeBadge && (
        <div className="absolute top-4 right-4 bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-medium border border-primary/30">
          Free
        </div>
      )}
      
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground leading-tight">
          {brainstorm.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-3">
          {brainstorm.content.substring(0, 150)}
          {brainstorm.content.length > 150 && "..."}
        </p>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{brainstorm.author_display_name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatDistanceToNow(new Date(brainstorm.created_at))} ago</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}