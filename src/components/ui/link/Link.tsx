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
      className={`font-medium text-blue-600 hover:text-blue-500 ${className}`}
      {...props}
    >
      {children}
    </RouterLink>
  );
};
