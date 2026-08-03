import type { ReactNode } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';

interface TransactionItemRowShellProps {
  title?: string;
  availabilityText?: ReactNode;
  canRemove: boolean;
  disabled?: boolean;
  onRemove: () => void;
  children: ReactNode;
}

export const TransactionItemRowShell = ({
  title,
  availabilityText,
  canRemove,
  disabled = false,
  onRemove,
  children,
}: TransactionItemRowShellProps) => {
  const removeLabel = title ? `Remove ${title.toLowerCase()}` : 'Remove row';

  return (
    <div className="rounded-lg border border-border-secondary bg-surface-primary p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          {title ? (
            <div className="text-sm font-semibold text-text-primary">{title}</div>
          ) : null}
          {availabilityText ? (
            <div className="text-xs text-text-tertiary">{availabilityText}</div>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          {canRemove ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled}
              onClick={onRemove}
              aria-label={removeLabel}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>

      {children}
    </div>
  );
};

export default TransactionItemRowShell;
