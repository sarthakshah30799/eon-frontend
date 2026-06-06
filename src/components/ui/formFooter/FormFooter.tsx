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
}

export const FormFooter = ({
  formId,
  submitLabel,
  backLabel="Back",
  onBackClick,
  onCancel,
  isSubmitting,
}: FormFooterProps) => {
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-primary bg-white/95 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm lg:left-[var(--app-sidebar-offset)]">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-end gap-3 px-4 py-3">
        {backLabel && onBackClick && (
          <div className="mr-auto">
            <BackButton onClick={onBackClick} label={backLabel} />
          </div>
        )}
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
        <Button
          type="submit"
          form={formId}
          disabled={isSubmitting}
          className=" px-4 py-2"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </div>,
    document.body
  );
};

export default FormFooter;
