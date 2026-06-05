import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'ui-btn-primary',
      secondary: 'ui-btn-secondary',
      outline: 'ui-btn-secondary', // For backward compatibility
      ghost: 'ui-btn-secondary bg-transparent border-transparent', // For backward compatibility
      danger: 'ui-btn-danger',
    };

    // Sizes are mostly handled by base ui-btn, but we can add padding overrides if really needed.
    // The design system specs only one base size (11px, 0.6875rem), so we might just ignore the size prop or map it slightly.
    const sizes = {
      sm: 'px-4 py-2 text-[10px]',
      md: '', // base size from ui-btn
      lg: 'px-6 py-4 text-[12px]',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'ui-btn',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
