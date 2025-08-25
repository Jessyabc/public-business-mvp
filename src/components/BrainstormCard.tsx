import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Zap, MessageSquare, User, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/ui/components/GlassCard';
import { getTScoreBadgeVariant } from '@/lib/score/tScore';
import type { Brainstorm } from '@/services/mock/brainstorms';

interface BrainstormCardProps {
  brainstorm: Brainstorm;
  showReplies?: boolean;
  isOptimistic?: boolean;
  onClick?: () => void;
}

export function BrainstormCard({ 
  brainstorm, 
  showReplies = true, 
  isOptimistic = false,
  onClick 
}: BrainstormCardProps) {
  const Card = ({ children }: { children: React.ReactNode }) => {
    if (onClick) {
      return (
        <GlassCard 
          hover 
          className={`cursor-pointer transition-all duration-200 ${
            isOptimistic ? 'opacity-70 animate-pulse' : 'hover:shadow-lg hover:-translate-y-0.5'
          }`}
          onClick={onClick}
        >
          {children}
        </GlassCard>
      );
    }

    return (
      <Link to={`/public/brainstorms/${brainstorm.id}`} className="block">
        <GlassCard 
          hover 
          className={`transition-all duration-200 ${
            isOptimistic ? 'opacity-70 animate-pulse' : 'hover:shadow-lg hover:-translate-y-0.5'
          }`}
        >
          {children}
        </GlassCard>
      </Link>
    );
  };

  return (
    <Card>
      <div className="space-y-4">
        {/* Content */}
        <p className="text-foreground leading-relaxed text-sm md:text-base">
          {brainstorm.text}
        </p>
        
        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span className="font-medium">{brainstorm.authorName}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>
                {formatDistanceToNow(new Date(brainstorm.createdAt), { addSuffix: true })}
              </span>
            </div>

            {showReplies && brainstorm.replyCount > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{brainstorm.replyCount} replies</span>
              </div>
            )}
          </div>
          
          {/* T-Score Badge */}
          <Badge 
            variant={getTScoreBadgeVariant(brainstorm.tScore)}
            className="flex items-center gap-1 font-semibold"
          >
            <Zap className="w-3 h-3" />
            {brainstorm.tScore}
          </Badge>
        </div>
      </div>
    </Card>
  );
}