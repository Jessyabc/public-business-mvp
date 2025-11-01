import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useUIModeStore } from '@/stores/uiModeStore';

interface PageProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Page({ 
  children, 
  className, 
  maxWidth = 'lg',
  padding = 'md'
}: PageProps) {
  const { uiMode } = useUIModeStore();

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div 
      className={cn(
        // Base layout - transparent to allow orbital background through
        'min-h-screen w-full relative bg-transparent',
        
        // Mode-specific transitions
        'transition-all duration-700 ease-in-out',
        
        className
      )}
    >
      {/* Content container */}
      <div className={cn(
        'mx-auto',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        'relative z-10'
      )}>
        {children}
      </div>
    </div>
  );
}