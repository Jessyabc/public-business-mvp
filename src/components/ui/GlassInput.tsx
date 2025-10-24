import React from 'react';
import { cn } from '@/lib/utils';

interface GlassInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>, 'as'> {
  as?: 'input' | 'textarea';
}

export const GlassInput = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  GlassInputProps
>(({ className, as: Component = 'input', ...props }, ref) => {
  const baseClasses = cn(
    'w-full rounded-lg px-4 py-3',
    'bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)]',
    'border border-[var(--glass-border)]',
    'text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]',
    'focus:outline-none focus:ring-2 focus:ring-[var(--focus)]',
    'transition-all duration-200',
    Component === 'textarea' && 'resize-none min-h-[100px]',
    className,
  );

  if (Component === 'textarea') {
    return (
      <textarea
        ref={ref as React.Ref<HTMLTextAreaElement>}
        className={baseClasses}
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
