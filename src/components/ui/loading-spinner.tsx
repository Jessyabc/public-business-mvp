import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  variant?: 'default' | 'u-score';
}

export function LoadingSpinner({ className, variant = 'default' }: LoadingSpinnerProps) {
  if (variant === 'u-score') {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <img 
          src="/lovable-uploads/26ffd67e-8031-46ae-8964-c6b547a1238a.png"
          alt="U-Score Loading" 
          className="w-8 h-8 animate-pulse"
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <img 
        src="/lovable-uploads/77267ade-34ff-4c2e-8797-fb16de997bd1.png"
        alt="Loading" 
        className="w-8 h-8 animate-spin"
      />
    </div>
  );
}