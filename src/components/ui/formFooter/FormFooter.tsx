import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../button1';
import { BackButton } from '../backButton';

interface FormFooterProps {
  formId?: string;
  submitLabel?: string;
  backLabel?: string;
  onBackClick?: () => void;
  onCancel?: () => void | Promise<void>;
  isSubmitting: boolean;
  isSubmitDisabled?: boolean;
  showSubmit?: boolean;
  actions?: ReactNode;
  submitMessage?: string;
}

export const FormFooter = ({
  formId,
  submitLabel,
  backLabel="Back",
  onBackClick,
  onCancel,
  isSubmitting,
  isSubmitDisabled = false,
  showSubmit = true,
  actions,
  submitMessage,
}: FormFooterProps) => {
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-primary bg-white/95 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm lg:left-[var(--app-sidebar-offset)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
        {(backLabel && onBackClick) || actions || submitMessage ? (
          <div className="mr-auto flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex items-center gap-2">
              {backLabel && onBackClick ? (
                <BackButton onClick={onBackClick} label={backLabel} />
              ) : null}
              {actions}
            </div>
            {submitMessage ? (
              <p
                className={`max-w-2xl text-sm ${
                  isSubmitDisabled ? 'text-error-600' : 'text-text-secondary'
                }`}
              >
                {submitMessage}
              </p>
            ) : null}
          </div>
        ) : null}
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-xl! px-4 py-2"
          >
            Cancel
          </Button>
        )}
        {showSubmit ? (
          <Button
            type="submit"
            form={formId}
            disabled={isSubmitting || isSubmitDisabled}
            className=" px-4 py-2"
          >
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        ) : null}
      </div>
    </div>,
    document.body
  );
};

export default FormFooter;
