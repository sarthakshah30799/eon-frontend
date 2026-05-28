import { Button } from '../button1';

export interface BackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export const BackButton = ({
  onClick,
  label = 'Back',
  className = '',
}: BackButtonProps) => {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className={`inline-flex items-center gap-2 !rounded-sm px-3 py-2 text-sm font-medium ${className}`}
    >
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15 19l-7-7 7-7"
        />
      </svg>
      <span>{label}</span>
    </Button>
  );
};

export default BackButton;
