import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button, Modal } from '@/components/ui';
import { FormFieldTextarea } from '@/components/forms';
import toast from 'react-hot-toast';
import type { ITransferFormValues, TransferStatus } from '../types';

interface TransferApprovalActionsProps {
  transferId: string;
  status: TransferStatus;
  canApprove: boolean;
  accepting: boolean;
  rejecting: boolean;
  onAccept: (id: string) => void;
  onReject: (params: { id: string; remarks: string }) => void;
}

export const TransferApprovalActions = ({
  transferId,
  status,
  canApprove,
  accepting,
  rejecting,
  onAccept,
  onReject,
}: TransferApprovalActionsProps) => {
  const form = useFormContext<ITransferFormValues>();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const isHeld = status === 'HELD';

  if (!canApprove) {
    return (
      <span className="rounded-md border border-border-primary bg-surface-secondary px-3 py-2 text-xs text-text-secondary">
        Approval is available only to the destination branch/counter or admin/HO users.
      </span>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="default"
        disabled={!isHeld || accepting || rejecting}
        onClick={() => onAccept(transferId)}
      >
        {accepting ? 'Accepting...' : 'Accept'}
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={!isHeld || accepting || rejecting}
        onClick={() => {
          form.setValue('rejectionReason', '');
          setIsRejectModalOpen(true);
        }}
      >
        {rejecting ? 'Rejecting...' : 'Reject'}
      </Button>
      <Modal
        open={isRejectModalOpen}
        onOpenChange={open => {
          if (!open) {
            form.setValue('rejectionReason', '');
          }
          setIsRejectModalOpen(open);
        }}
        title="Reject Transfer"
        description="Enter the reason for rejecting this transfer request."
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.setValue('rejectionReason', '');
                setIsRejectModalOpen(false);
              }}
              disabled={rejecting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              disabled={rejecting}
              onClick={() => {
                const remarks = String(form.getValues('rejectionReason') ?? '').trim();
                if (!remarks) {
                  toast.error('Rejection reason is required');
                  return;
                }
                setIsRejectModalOpen(false);
                onReject({ id: transferId, remarks });
              }}
            >
              {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </div>
        }
      >
        <FormFieldTextarea
          name="rejectionReason"
          label="Reason"
          placeholder="Enter rejection reason"
          rows={4}
          wrapperClassName="max-w-none"
        />
      </Modal>
    </>
  );
};
