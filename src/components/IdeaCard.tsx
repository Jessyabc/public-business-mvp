import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface OpenIdea {
  id: string;
  content: string;
  linked_brainstorms_count: number;
  created_at: string;
  updated_at: string;
}

interface IdeaCardProps {
  idea: OpenIdea;
  onClick?: () => void;
}

export function IdeaCard({ idea, onClick }: IdeaCardProps) {
  return (
    <Card 
      className="glass-business-card cursor-pointer hover:scale-105 transition-all duration-300 border-primary/20"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <p className="text-foreground leading-relaxed mb-4">
          {idea.content}
        </p>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{idea.linked_brainstorms_count} brainstorms</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDistanceToNow(new Date(idea.updated_at))} ago</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}