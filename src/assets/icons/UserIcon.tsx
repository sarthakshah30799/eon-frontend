import React from 'react';

interface UserIconProps {
  className?: string;
}

export const UserIcon: React.FC<UserIconProps> = ({ className = 'h-5 w-5' }) => {
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
        d="M20 21a8 8 0 10-16 0m16 0a8 8 0 00-16 0m16 0H4m8-11a4 4 0 100-8 4 4 0 000 8z"
      />
    </svg>
  );
};
