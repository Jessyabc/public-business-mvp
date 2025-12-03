import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ExternalLink, Bookmark, Share2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Post as CanonicalPost } from '@/types/post';
import { UScoreRating } from './UScoreRating';
import { usePostRating } from '@/hooks/usePostRating';

type AccordionPost = Pick<
  CanonicalPost,
  'id' | 'title' | 'content' | 't_score' | 'u_score' | 'views_count' | 'created_at' | 'mode'
>;

interface AccordionCardProps {
  post: AccordionPost;
  onView?: (postId: string) => void;
  onSave?: (postId: string) => void;
  onShare?: (postId: string) => void;
  className?: string;
}

export const AccordionCard = memo(({ post, onView, onSave, onShare, className }: AccordionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { userRating, averageScore, ratingCount, submitRating } = usePostRating(post.id);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && onView) {
      onView(post.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <motion.div
      className={cn(
        'glass-low rounded-2xl overflow-hidden transition-all duration-300',
        'border border-[var(--card-border)] shadow-[var(--elevation-8)]',
        'hover:shadow-[var(--elevation-16)] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      {/* Collapsed Preview */}
      <div
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className="p-6 cursor-pointer select-none"
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} post: ${post.title || post.content.substring(0, 50)}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Title or content preview */}
            {post.title && (
              <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1">
                {post.title}
              </h3>
            )}
            
            <motion.p
              className={cn(
                'text-muted-foreground transition-all',
                isExpanded ? '' : 'line-clamp-2'
              )}
              layout
            >
              {post.content}
            </motion.p>

            {/* Badges */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {post.t_score && post.t_score > 50 && (
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  T-Score: {post.t_score}
                </Badge>
              )}
              {post.mode && (
                <Badge variant="outline" className="text-xs">
                  {post.mode === 'business' ? '💼 Business' : '🧠 Public'}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Toggle Button */}
          <motion.button
            className="shrink-0 p-2 rounded-lg hover:bg-accent/10 transition-colors focus-visible:ring-2 focus-visible:ring-primary"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        </div>

        {/* Metadata Row */}
        <motion.div 
          className="flex items-center gap-4 mt-4 text-sm text-muted-foreground"
          layout
        >
          {(averageScore !== null || ratingCount > 0) && (
            <span className="font-semibold text-green-600">
              U: {averageScore?.toFixed(1) ?? '—'} ({ratingCount})
            </span>
          )}
          {post.t_score && (
            <span className="font-semibold text-purple-600">
              T: {post.t_score}
            </span>
          )}
          {post.views_count !== undefined && (
            <span>👁️ {post.views_count}</span>
          )}
          <span className="ml-auto">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </span>
        </motion.div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="overflow-hidden"
              style={{
                // @ts-expect-error - CSS custom property
                '--animation-reduce': window.matchMedia('(prefers-reduced-motion: reduce)').matches ? '0.5' : '1'
              }}
          >
            <div className="px-6 pb-6 border-t border-[var(--card-border)]/40">
              <div className="pt-4">
                {/* Full Content */}
                <div className="prose prose-sm max-w-none mb-4">
                  <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* U-Score Rating */}
                <div className="mb-4 p-4 rounded-xl bg-muted/20 border border-[var(--card-border)]/30">
                  <UScoreRating
                    postId={post.id}
                    currentScore={averageScore}
                    ratingCount={ratingCount}
                    userRating={userRating}
                    onRate={submitRating}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-4 border-t border-[var(--card-border)]/20">
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass-low focus-visible:ring-2 focus-visible:ring-primary hover:bg-accent/20"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onView) {
                        onView(post.id);
                      }
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Full
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass-low focus-visible:ring-2 focus-visible:ring-primary hover:bg-accent/20"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSave) {
                        onSave(post.id);
                      }
                    }}
                  >
                    <Bookmark className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass-low ml-auto focus-visible:ring-2 focus-visible:ring-primary hover:bg-accent/20"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onShare) {
                        onShare(post.id);
                      }
                    }}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

AccordionCard.displayName = 'AccordionCard';
