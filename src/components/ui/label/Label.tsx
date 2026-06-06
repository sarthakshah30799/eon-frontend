import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <label
      className={`block text-xs font-medium text-text-secondary ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};
