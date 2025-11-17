import { formatDistanceToNow } from 'date-fns';
import { User } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { sanitizeText } from '@/lib/sanitize';
import type { Brainstorm } from '@/hooks/useBrainstorms';

interface BrainstormCardProps {
  brainstorm: Brainstorm;
  onClick?: () => void;
  className?: string;
}

export function BrainstormCard({ brainstorm, onClick, className }: BrainstormCardProps) {
  const snippet = sanitizeText(brainstorm.content).slice(0, 150) + (brainstorm.content.length > 150 ? '...' : '');
  const timeAgo = formatDistanceToNow(new Date(brainstorm.created_at), { addSuffix: true });

  return (
    <Card 
      className={`cursor-pointer elevation-4 hover:elevation-8 transition-shadow ${className}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{sanitizeText(brainstorm.title)}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span className="truncate">{brainstorm.author_display_name}</span>
              <span>•</span>
              <span>{timeAgo}</span>
            </div>
          </div>
          <Badge variant={brainstorm.is_public ? 'default' : 'secondary'}>
            {brainstorm.is_public ? 'Public' : 'Private'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {snippet}
        </p>
      </CardContent>
    </Card>
  );
}