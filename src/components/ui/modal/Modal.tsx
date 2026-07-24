import {
  useEffect,
  useId,
  useMemo,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../button1';

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl',
};

export const Modal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
  ...props
}: ModalProps) => {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onOpenChange]);

  const modalNode = useMemo(() => {
    if (!open) {
      return null;
    }

    return (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        onMouseDown={() => onOpenChange(false)}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          className={cn(
            'w-full overflow-hidden rounded-sm border border-border-primary bg-surface-primary shadow-2xl',
            sizeClasses[size],
            className
          )}
          onMouseDown={(event: MouseEvent<HTMLDivElement>) => {
            event.stopPropagation();
          }}
          {...props}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border-primary px-5 py-4">
            <div className="space-y-1">
              <h2 id={titleId} className="text-lg font-semibold text-text-primary">
                {title}
              </h2>
              {description && (
                <p
                  id={descriptionId}
                  className="text-sm leading-6 text-text-secondary"
                >
                  {description}
                </p>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-sm"
              aria-label="Close modal"
              onClick={() => onOpenChange(false)}
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>

          <div className="max-h-[75vh] overflow-y-auto px-5 py-4">{children}</div>

          {footer && (
            <div className="border-t border-border-primary px-5 py-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  }, [
    className,
    description,
    descriptionId,
    footer,
    onOpenChange,
    open,
    props,
    size,
    titleId,
    title,
    children,
  ]);

  return open ? createPortal(modalNode, document.body) : null;
};

export default Modal;
