import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  lines?: number;
  avatar?: boolean;
}

export function Skeleton({ className, lines = 3, avatar = false }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="flex items-start space-x-4">
        {avatar && (
          <div className="w-10 h-10 bg-muted rounded-full"></div>
        )}
        <div className="flex-1 space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-4 bg-muted rounded',
                i === lines - 1 && 'w-3/4', // Last line shorter
                i === 0 && 'w-5/6' // First line slightly shorter
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} avatar lines={2} />
      ))}
    </div>
  );
}