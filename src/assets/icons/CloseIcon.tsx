import React from 'react';

interface CloseIconProps {
  className?: string;
}

export const CloseIcon: React.FC<CloseIconProps> = ({ className = 'h-5 w-5' }) => {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
};
