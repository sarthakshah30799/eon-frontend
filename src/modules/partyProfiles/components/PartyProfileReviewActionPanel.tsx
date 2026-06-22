import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button, Modal } from '@/components/ui';
import { FormFieldCheckbox, FormFieldTextarea } from '@/components/forms';
import type {
  ICreatePartyProfile,
  IReviewPartyProfilePayload,
} from '../types';

interface PartyProfileReviewActionPanelProps {
  reviewMode?: boolean;
  isSubmitting?: boolean;
  onReviewSubmit?: (values: IReviewPartyProfilePayload) => void | Promise<void>;
}

export const PartyProfileReviewActionPanel = ({
  reviewMode = false,
  isSubmitting = false,
  onReviewSubmit,
}: PartyProfileReviewActionPanelProps) => {
  const { getValues, setError, clearErrors, resetField } =
    useFormContext<ICreatePartyProfile>();
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectExpanded, setIsRejectExpanded] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    if (!reviewMode) {
      setIsApproveModalOpen(false);
      setIsRejectExpanded(false);
    }
  }, [reviewMode]);

  const submitReview = useCallback(
    async (status: IReviewPartyProfilePayload['status']) => {
      if (!onReviewSubmit) {
        return;
      }

      const active = Boolean(getValues('active'));
      const rejectReason = String(getValues('rejectReason') || '').trim();

      if (status === 'reject' && !rejectReason) {
        setError('rejectReason', {
          type: 'manual',
          message: 'Reject reason is required when rejecting a profile.',
        });
        return;
      }

      clearErrors('rejectReason');
      setIsReviewing(true);

      try {
        await onReviewSubmit({
          status,
          active,
          rejectReason: status === 'reject' ? rejectReason : undefined,
        });

        if (status === 'reject') {
          setIsRejectExpanded(false);
          resetField('rejectReason', { defaultValue: '' });
        }

        setIsApproveModalOpen(false);
      } finally {
        setIsReviewing(false);
      }
    },
    [clearErrors, getValues, onReviewSubmit, resetField, setError]
  );

  const isDisabled = !reviewMode || isSubmitting || isReviewing;

  if (!reviewMode) {
    return null;
  }

  return (
    <>
      <div className="rounded-xl border border-border-primary bg-surface-primary p-4 shadow-sm">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Choose the active state and then approve or reject this profile.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <FormFieldCheckbox
              name="active"
              label="Active"
              disabled={isDisabled}
            />
            <p className="text-xs text-text-tertiary">
              Approving or rejecting will also record who updated the status and when.
            </p>
          </div>

          {isRejectExpanded && (
            <div className="space-y-2">
              <FormFieldTextarea
                name="rejectReason"
                label="Reject Reason"
                placeholder="Enter the rejection reason before submitting"
                disabled={isDisabled}
                rows={4}
                wrapperClassName="max-w-none"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isDisabled}
              onClick={() => {
                if (!isRejectExpanded) {
                  setIsRejectExpanded(true);
                  return;
                }

                void submitReview('reject');
              }}
            >
              {isRejectExpanded ? 'Submit Reject' : 'Reject'}
            </Button>

            <Button
              type="button"
              disabled={isDisabled}
              onClick={() => setIsApproveModalOpen(true)}
            >
              Approve
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={isApproveModalOpen}
        onOpenChange={setIsApproveModalOpen}
        title="Approve profile"
        description="Please confirm that this profile should be approved and activated."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsApproveModalOpen(false)}
              disabled={isReviewing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void submitReview('approve')}
              disabled={isReviewing}
            >
              Confirm Approve
            </Button>
          </div>
        }
      >
        <p className="text-sm leading-6 text-text-secondary">
          This will approve the profile using the selected active state.
        </p>
      </Modal>
    </>
  );
};

export default PartyProfileReviewActionPanel;
