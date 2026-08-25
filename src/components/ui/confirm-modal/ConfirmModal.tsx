import type { ReactNode } from 'react';
import { Button, Modal } from '@/components/ui';

export interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'default' | 'destructive';
  onConfirm: () => void | Promise<void>;
  isConfirming?: boolean;
  confirmDisabled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  dismissible?: boolean;
}

export const ConfirmModal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'default',
  onConfirm,
  isConfirming = false,
  confirmDisabled = false,
  size = 'md',
  dismissible = true,
}: ConfirmModalProps) => {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal
      open={open}
      onOpenChange={nextOpen => {
        if (isConfirming && !nextOpen) {
          return;
        }
        onOpenChange(nextOpen);
      }}
      title={title}
      description={description}
      size={size}
      dismissible={dismissible && !isConfirming}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isConfirming}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            disabled={confirmDisabled || isConfirming}
            onClick={() => {
              void handleConfirm();
            }}
          >
            {isConfirming ? 'Please wait…' : confirmLabel}
          </Button>
        </div>
      }
    >
      {children}
    </Modal>
  );
};

export default ConfirmModal;
