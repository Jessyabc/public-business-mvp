import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  variant?: 'default' | 'u-score' | 'minimal';
}

/**
 * LoadingSpinner - Performance-optimized loading indicator
 * 
 * Default: CSS-only spinner (no image requests, instant render)
 * u-score: Branded image spinner for specific contexts
 * minimal: Ultra-lightweight CSS-only spinner
 */
export function LoadingSpinner({ className, variant = 'default' }: LoadingSpinnerProps) {
  // U-Score branded variant
  if (variant === 'u-score') {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <img 
          src="/lovable-uploads/26ffd67e-8031-46ae-8964-c6b547a1238a.png"
          alt="U-Score Loading" 
          className="w-8 h-8 animate-pulse"
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }

  // Minimal CSS-only spinner (fastest)
  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div 
          className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--text-secondary)', borderTopColor: 'transparent' }}
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  // Default: CSS-only spinner (no image request, instant render)
  // Uses brand color with smooth animation
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div 
        className="relative w-8 h-8"
        role="status"
        aria-label="Loading"
      >
        {/* Outer ring */}
        <div 
          className="absolute inset-0 rounded-full border-2 animate-spin"
          style={{ 
            borderColor: 'rgba(72, 159, 227, 0.2)',
            borderTopColor: 'rgb(72, 159, 227)'
          }}
        />
        {/* Inner glow */}
        <div 
          className="absolute inset-1 rounded-full animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, rgba(72, 159, 227, 0.1) 0%, transparent 70%)'
          }}
        />
      </div>
    </div>
  );
}