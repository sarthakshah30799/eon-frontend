import React from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-secondary-100 text-text-secondary border-border-muted',
  success: 'bg-success-50 text-success-600 border-success-500/20',
  warning: 'bg-warning-50 text-warning-600 border-warning-500/20',
  error: 'bg-error-50 text-error-600 border-error-500/20',
  info: 'bg-primary-50 text-primary-700 border-primary-200',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
  ...props
}) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
