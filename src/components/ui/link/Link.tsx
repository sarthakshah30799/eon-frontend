import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({
  to,
  children,
  className = '',
  ...props
}) => {
  return (
    <RouterLink
      to={to}
      className={`font-medium text-primary-600 hover:text-primary-700 ${className}`}
      {...props}
    >
      {children}
    </RouterLink>
  );
};
