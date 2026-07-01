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
      variant="link"
      size="sm"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-0! py-0! text-sm leading-5 font-medium no-underline ${className}`}
    >
      <svg
        aria-hidden="true"
        className="h-3.5 w-3.5"
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
      <span className="text-[14px] leading-5">{label}</span>
    </Button>
  );
};

export default BackButton;
