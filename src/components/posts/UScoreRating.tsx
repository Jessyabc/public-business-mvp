import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UScoreRatingProps {
  postId: string;
  currentScore?: number | null;
  ratingCount?: number;
  userRating?: number | null;
  onRate?: (rating: number) => Promise<void>;
  compact?: boolean;
  className?: string;
}

export const UScoreRating = memo(({
  postId,
  currentScore,
  ratingCount = 0,
  userRating,
  onRate,
  compact = false,
  className
}: UScoreRatingProps) => {
  const { user } = useAuth();
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  const [selectedValue, setSelectedValue] = useState<number | null>(userRating ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRate = async (value: number) => {
    if (!user) {
      toast.error('Please sign in to rate posts');
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    setSelectedValue(value);

    try {
      if (onRate) {
        await onRate(value);
      }
      toast.success(`Rated ${value}/10`);
    } catch (error) {
      console.error('Failed to submit rating:', error);
      toast.error('Failed to submit rating');
      setSelectedValue(userRating ?? null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayValue = hoveredValue ?? selectedValue ?? currentScore;

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span className="text-sm font-semibold text-green-500">
          U: {currentScore?.toFixed(1) ?? '—'}
        </span>
        {ratingCount > 0 && (
          <span className="text-xs text-muted-foreground">
            ({ratingCount})
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Rate Utility</span>
          {ratingCount > 0 && (
            <span className="text-xs text-muted-foreground">
              ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
            </span>
          )}
        </div>
        {displayValue && (
          <motion.span
            key={displayValue}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-lg font-bold text-green-500"
          >
            {typeof displayValue === 'number' ? displayValue.toFixed(1) : displayValue}/10
          </motion.span>
        )}
      </div>

      {/* Rating Scale */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => {
          const isSelected = selectedValue !== null && value <= selectedValue;
          const isHovered = hoveredValue !== null && value <= hoveredValue;
          const isActive = isHovered || isSelected;

          return (
            <motion.button
              key={value}
              type="button"
              disabled={isSubmitting}
              onClick={() => handleRate(value)}
              onMouseEnter={() => setHoveredValue(value)}
              onMouseLeave={() => setHoveredValue(null)}
              className={cn(
                'relative flex-1 h-8 rounded-md transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isActive
                  ? 'bg-green-500/80 shadow-[0_0_12px_rgba(34,197,94,0.4)]'
                  : 'bg-muted/30 hover:bg-muted/50'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span
                className={cn(
                  'absolute inset-0 flex items-center justify-center text-xs font-medium',
                  isActive ? 'text-white' : 'text-muted-foreground'
                )}
              >
                {value}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Not useful</span>
        <span>Very useful</span>
      </div>

      {/* User's existing rating indicator */}
      {userRating && (
        <p className="text-xs text-muted-foreground text-center">
          You rated this {userRating}/10
        </p>
      )}
    </div>
  );
});

UScoreRating.displayName = 'UScoreRating';
