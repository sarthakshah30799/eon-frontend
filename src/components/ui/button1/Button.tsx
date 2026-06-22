import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-primary-500 text-text-inverse hover:bg-primary-600 focus:ring-primary-500',
        accent:
          'bg-[var(--button-accent)] text-white hover:brightness-95 focus:ring-[var(--button-accent)]',
        destructive:
          'bg-error-500 text-text-inverse hover:bg-error-600 focus:ring-error-500',
        outline:
          'border border-border-secondary bg-surface-primary text-text-secondary hover:bg-surface-secondary focus:ring-primary-500',
        secondary:
          'bg-secondary-500 text-text-inverse hover:bg-secondary-600 focus:ring-secondary-500',
        ghost:
          'bg-primary-50 text-primary-700 hover:bg-primary-100 focus:ring-primary-500',
        link: 'text-primary-600 hover:text-primary-700 underline focus:ring-primary-500',
      },
      size: {
        default: 'px-4 py-2',
        sm: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
        icon: 'p-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
