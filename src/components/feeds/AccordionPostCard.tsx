import { useState } from 'react';
import { ChevronDown, ExternalLink, Bookmark, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  title?: string;
  content: string;
  t_score?: number;
  views_count?: number;
  likes_count?: number;
  created_at: string;
}

interface AccordionPostCardProps {
  post: Post;
  onView?: (postId: string) => void;
  onSave?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

export function AccordionPostCard({ post, onView, onSave, onShare }: AccordionPostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && onView) {
      onView(post.id);
    }
  };

  return (
    <div className="glass-business-card glass-low rounded-2xl overflow-hidden transition-all duration-300 hover:elevation-8">
      {/* Collapsed Preview */}
      <div
        onClick={handleToggle}
        className="p-6 cursor-pointer select-none"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {post.title && (
              <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1">
                {post.title}
              </h3>
            )}
            <p className={`text-muted-foreground ${isExpanded ? '' : 'line-clamp-2'} transition-all`}>
              {post.content}
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className={`shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          >
            <ChevronDown className="w-5 h-5" />
          </Button>
        </div>

        {/* Metadata Row */}
        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          {post.t_score && (
            <span className="font-semibold text-primary">
              T-Score: {post.t_score}
            </span>
          )}
          <span>Views: {post.views_count || 0}</span>
          <span>Likes: {post.likes_count || 0}</span>
          <span className="ml-auto">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="accordion-content expanded px-6 pb-6 border-t border-border/40">
          <div className="pt-4">
            {/* Full Content */}
            <div className="prose prose-sm max-w-none mb-4">
              <p className="text-foreground">{post.content}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-4 border-t border-border/20">
              <Button
                variant="outline"
                size="sm"
                className="glass-low"
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.(post.id);
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Full
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="glass-low"
                onClick={(e) => {
                  e.stopPropagation();
                  onSave?.(post.id);
                }}
              >
                <Bookmark className="w-4 h-4 mr-2" />
                Save
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="glass-low ml-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare?.(post.id);
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
