import React from 'react';
import { cn } from '@/lib/utils';

interface GlassInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>, 'as'> {
  as?: 'input' | 'textarea';
  rows?: number;
}

export const GlassInput = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  GlassInputProps
>(({ className, as: Component = 'input', rows, ...props }, ref) => {
  const baseClasses = cn(
    'w-full rounded-lg px-4 py-3',
    'border outline-none',
    'bg-[var(--glass-bg)]',
    'border-[var(--glass-border)]',
    'backdrop-blur-[var(--glass-blur)]',
    'text-foreground',
    'placeholder:text-muted-foreground',
    'focus:ring-2 focus:ring-[var(--focus)] focus:border-transparent',
    'transition-all duration-200',
    Component === 'textarea' && 'resize-none',
    className,
  );

  if (Component === 'textarea') {
    return (
      <textarea
        ref={ref as React.Ref<HTMLTextAreaElement>}
        className={baseClasses}
        rows={rows || 6}
        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
    );
  }

  return (
    <input
      ref={ref as React.Ref<HTMLInputElement>}
      className={baseClasses}
      {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
    />
  );
});

GlassInput.displayName = 'GlassInput';
