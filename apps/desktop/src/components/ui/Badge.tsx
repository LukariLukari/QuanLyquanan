import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'error' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'ui-chip',
    success: 'ui-chip text-green-400 border-green-500/30 bg-green-500/10',
    error: 'ui-chip text-[var(--danger-text)] border-[var(--danger-bg)] bg-[var(--danger-bg)]',
    outline: 'ui-chip bg-transparent',
  };

  return (
    <div
      className={cn(
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
