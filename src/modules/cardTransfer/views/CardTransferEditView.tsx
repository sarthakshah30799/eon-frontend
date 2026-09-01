import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { Form, FormFieldTextarea } from '@/components/forms';
import { Button, Modal } from '@/components/ui';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/lib/AuthContext';
import { getTransactionDatePolicy } from '@/modules/transactionPolicies/utils/transactionDatePolicy';
import toast from 'react-hot-toast';
import { CardTransferForm } from '../forms';
import { createCardTransferSchema } from '../schema';
import {
  useAcceptCardTransfer,
  useCancelCardTransfer,
  useDeleteCardTransfer,
  useGetCardTransfer,
  usePrintCardTransferStock,
  useRejectCardTransfer,
  useUpdateCardTransfer,
} from '../hooks';
import type { CardTransferFormValues } from '../types';
import { CARD_TRANSFER_COPY } from '../constants';
import { mapRequestToForm } from '../utils';
import { useCardStockReferences } from '@/modules/cardStock/hooks';
import { CARD_STOCK_PRINT_TEXT } from '@/modules/cardStock/constants/cardStockConstants';
import {
  getCardStockPrintButtonLabel,
  getCardStockPrintCopyType,
} from '@/modules/cardStock/utils/cardStockPrintUtils';

type ConfirmationAction = 'REJECT' | 'CANCEL' | null;

export const CardTransferEditView = () => {
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const { user, activeBranchId, policyContext } = useAuth();
  const { data: request, isLoading, error } = useGetCardTransfer(id);
  const references = useCardStockReferences();
  const [confirmationAction, setConfirmationAction] =
    useState<ConfirmationAction>(null);
  const [remarks, setRemarks] = useState('');
  const updateMutation = useUpdateCardTransfer();
  const acceptMutation = useAcceptCardTransfer();
  const rejectMutation = useRejectCardTransfer();
  const cancelMutation = useCancelCardTransfer();
  const deleteMutation = useDeleteCardTransfer();
  const { printTransfer, isPrinting } = usePrintCardTransferStock();
  const initialValues = useMemo(
    () => (request ? mapRequestToForm(request) : undefined),
    [request]
  );
  const cardTransferSchema = useMemo(
    () =>
      createCardTransferSchema(references.currencies, references.products),
    [references.currencies, references.products]
  );
  const policy = useMemo(
    () => getTransactionDatePolicy(policyContext),
    [policyContext]
  );

  if (isLoading || references.isLoading) return <Loader />;
  if (error || !request || !initialValues) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-700">
        {error instanceof Error
          ? error.message
          : 'CARD transfer request not found.'}
      </div>
    );
  }

  const hasHoAccess = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);
  const isHeld = request.status === 'HELD';
  const isAccepted = request.status === 'ACCEPTED';
  const isDestinationBranchReviewer =
    !hasHoAccess && activeBranchId === request.destinationBranchId;
  const canManageHeldRequest = isHeld && hasHoAccess;
  const canReviewHeldRequest =
    isHeld && (hasHoAccess || isDestinationBranchReviewer);
  const canPrintStockOut =
    isAccepted && (hasHoAccess || activeBranchId === request.sourceBranchId);
  const canPrintStockIn =
    isAccepted &&
    (hasHoAccess || activeBranchId === request.destinationBranchId);
  const stockOutCopyType = getCardStockPrintCopyType(request.sourcePrintCount);
  const stockInCopyType = getCardStockPrintCopyType(
    request.destinationPrintCount
  );
  const readOnly = !canManageHeldRequest;
  const isConfirmationPending =
    confirmationAction === 'REJECT'
      ? rejectMutation.isPending
      : cancelMutation.isPending;
  const isActionPending =
    acceptMutation.isPending ||
    rejectMutation.isPending ||
    cancelMutation.isPending ||
    deleteMutation.isPending ||
    updateMutation.isPending ||
    isPrinting;

  const run = async (action: Promise<unknown>, message: string) => {
    await action;
    toast.success(message);
    navigate('/card-transfer');
  };
  const save = (values: CardTransferFormValues) =>
    run(
      updateMutation.mutateAsync({ id, values }),
      'CARD transfer request updated.'
    );
  const openConfirmation = (action: Exclude<ConfirmationAction, null>) => {
    setRemarks('');
    setConfirmationAction(action);
  };
  const confirmAction = () => {
    if (!remarks.trim()) {
      toast.error(
        confirmationAction === 'REJECT'
          ? 'Rejection reason is required.'
          : 'Cancellation reason is required.'
      );
      return;
    }
    if (confirmationAction === 'REJECT') {
      void run(
        rejectMutation.mutateAsync({ id, remarks: remarks.trim() }),
        'CARD transfer request rejected.'
      );
      return;
    }
    if (confirmationAction === 'CANCEL' && canManageHeldRequest) {
      void run(
        cancelMutation.mutateAsync({ id, remarks: remarks.trim() }),
        'CARD transfer request cancelled.'
      );
    }
  };

  return (
    <Form<CardTransferFormValues>
      id="card-transfer-edit-form"
      defaultValues={initialValues}
      resolver={yupResolver(cardTransferSchema) as never}
      mode="onChange"
      onError={() => {
        toast.error(CARD_TRANSFER_COPY.validationFailed);
      }}
      onSubmit={save}
      footer={{
        showSubmit: canManageHeldRequest,
        submitLabel: 'Save CARD Transfer',
        onCancel: canManageHeldRequest
          ? () => navigate('/card-transfer')
          : undefined,
        backLabel: canManageHeldRequest ? undefined : 'Back',
        onBackClick: canManageHeldRequest
          ? undefined
          : () => navigate('/card-transfer'),
        actions: (
          <div className="flex flex-wrap gap-2">
            {canPrintStockOut ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => void printTransfer(request, 'STOCK_OUT')}
                disabled={isActionPending}
              >
                {isPrinting
                  ? CARD_STOCK_PRINT_TEXT.preparing
                  : getCardStockPrintButtonLabel(
                      'STOCK_OUT',
                      stockOutCopyType,
                      {
                        transfer: true,
                      }
                    )}
              </Button>
            ) : null}
            {canPrintStockIn ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => void printTransfer(request, 'STOCK_IN')}
                disabled={isActionPending}
              >
                {isPrinting
                  ? CARD_STOCK_PRINT_TEXT.preparing
                  : getCardStockPrintButtonLabel('STOCK_IN', stockInCopyType, {
                      transfer: true,
                    })}
              </Button>
            ) : null}
            {canReviewHeldRequest ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openConfirmation('REJECT')}
                  disabled={isActionPending}
                >
                  Reject
                </Button>
                <Button
                  type="button"
                  loading={acceptMutation.isPending}
                  disabled={isActionPending}
                  onClick={() =>
                    void run(
                      acceptMutation.mutateAsync(id),
                      'CARD transfer request accepted.'
                    )
                  }
                >
                  Accept
                </Button>
              </>
            ) : null}
            {canManageHeldRequest ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openConfirmation('CANCEL')}
                  disabled={isActionPending}
                >
                  Cancel Request
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  loading={deleteMutation.isPending}
                  disabled={isActionPending}
                  onClick={() =>
                    void run(
                      deleteMutation.mutateAsync(id),
                      'CARD transfer request deleted.'
                    )
                  }
                >
                  Delete
                </Button>
              </>
            ) : null}
          </div>
        ),
      }}
    >
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            {readOnly ? 'CARD Transfer Request' : 'Edit CARD Transfer Sell'}
          </h1>
          <p className="text-sm text-text-secondary">
            {isDestinationBranchReviewer
              ? 'Review the request details, then accept or reject the transfer.'
              : readOnly
                ? `This request is ${request.status.toLowerCase()} and is read-only.`
                : 'Held requests can be edited or submitted for approval.'}
          </p>
        </div>
        <CardTransferForm
          readOnly={readOnly}
          destinationBranchReadOnly
          transactionDatePolicy={policy}
        />
      </div>
      <Modal
        open={confirmationAction !== null}
        onOpenChange={open => {
          if (!open) setConfirmationAction(null);
        }}
        title={
          confirmationAction === 'REJECT'
            ? 'Reject CARD Transfer Request'
            : 'Cancel CARD Transfer Request'
        }
        description="Enter a reason before confirming this action."
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmationAction(null)}
              disabled={isConfirmationPending}
            >
              Close
            </Button>
            <Button
              type="button"
              loading={isConfirmationPending}
              onClick={confirmAction}
            >
              {confirmationAction === 'REJECT'
                ? 'Confirm Reject'
                : 'Confirm Cancel'}
            </Button>
          </div>
        }
      >
        <FormFieldTextarea
          name="actionRemarks"
          label="Reason"
          value={remarks}
          onChange={event => setRemarks(event.target.value)}
          placeholder="Enter reason"
          rows={4}
        />
      </Modal>
    </Form>
  );
};

export default CardTransferEditView;
