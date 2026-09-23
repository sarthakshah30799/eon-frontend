import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { Form, FormFieldTextarea } from '@/components/forms';
import { Button, Modal } from '@/components/ui';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/lib/AuthContext';
import toast from 'react-hot-toast';
import {
  TtSettlementDocumentKind,
  TtSettlementDocumentStatus,
} from '@/api/ttSettlement';
import { TtSettlementForm } from '../forms';
import { ttSettlementSchema } from '../schema/ttSettlementSchema';
import { TT_SETTLEMENT_TEXT } from '../constants/ttSettlementConstants';
import {
  useAcceptTtSettlement,
  useCancelTtSettlement,
  useRejectTtSettlement,
  useTtSettlement,
} from '../hooks';
import type { TtSettlementFormValues } from '../types/ttSettlementTypes';
import { toFormItem } from '../utils/ttSettlementUtils';

type ConfirmationAction = 'REJECT' | 'CANCEL' | null;

export const TtSettlementEditView = () => {
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const { user } = useAuth();
  const isHo = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);
  const query = useTtSettlement(id);
  const acceptMutation = useAcceptTtSettlement();
  const rejectMutation = useRejectTtSettlement();
  const cancelMutation = useCancelTtSettlement();
  const [confirmationAction, setConfirmationAction] =
    useState<ConfirmationAction>(null);
  const [reason, setReason] = useState('');
  const document = query.data;
  const initialValues = useMemo<TtSettlementFormValues | null>(() => {
    if (!document) return null;
    return {
      kind: document.kind,
      issuerPartyProfileId: document.issuerPartyProfileId,
      issuerPartyProfileSnapshot: document.issuerPartyProfileSnapshot,
      currencyId: document.currencyId,
      currencySnapshot: document.currencySnapshot,
      branchId: document.branchId,
      branchSnapshot: document.branchSnapshot,
      hoBranchId: document.hoBranchId,
      hoBranchSnapshot: document.hoBranchSnapshot,
      transactionDate: String(document.transactionDate).slice(0, 10),
      transactionNumber: document.transactionNumber,
      reference: document.reference ?? '',
      remarks: document.remarks ?? '',
      items: (document.items ?? []).map(item =>
        toFormItem(item, document.kind)
      ),
    };
  }, [document]);

  const canCancel =
    document?.kind === TtSettlementDocumentKind.BRANCH_HO &&
    document.status === TtSettlementDocumentStatus.PENDING_HO_ACCEPTANCE &&
    !document.postingTransactionId;
  const canAccept = Boolean(isHo && canCancel);
  const isPending =
    acceptMutation.isPending ||
    rejectMutation.isPending ||
    cancelMutation.isPending;

  const run = async (action: Promise<unknown>, message: string) => {
    await action;
    toast.success(message);
    navigate('/tt-settlement');
  };

  if (query.isLoading) return <Loader />;
  if (query.error || !document || !initialValues) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-700">
        {query.error instanceof Error
          ? query.error.message
          : TT_SETTLEMENT_TEXT.notFound}
      </div>
    );
  }

  return (
    <Form<TtSettlementFormValues>
      id="tt-settlement-edit-form"
      defaultValues={initialValues}
      resolver={yupResolver(ttSettlementSchema) as never}
      onSubmit={() => undefined}
      footer={{
        showSubmit: false,
        backLabel: TT_SETTLEMENT_TEXT.back,
        onBackClick: () => navigate('/tt-settlement'),
        actions: (
          <div className="flex flex-wrap gap-2">
            {canAccept ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => {
                    setReason('');
                    setConfirmationAction('REJECT');
                  }}
                >
                  {TT_SETTLEMENT_TEXT.reject}
                </Button>
                <Button
                  type="button"
                  loading={acceptMutation.isPending}
                  disabled={isPending}
                  onClick={() =>
                    void run(
                      acceptMutation.mutateAsync(id),
                      TT_SETTLEMENT_TEXT.accepted
                    )
                  }
                >
                  {TT_SETTLEMENT_TEXT.accept}
                </Button>
              </>
            ) : null}
            {canCancel ? (
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  setReason('');
                  setConfirmationAction('CANCEL');
                }}
              >
                {TT_SETTLEMENT_TEXT.cancel}
              </Button>
            ) : null}
          </div>
        ),
      }}
    >
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            {TT_SETTLEMENT_TEXT.editTitle}
          </h1>
          <p className="text-sm text-text-secondary">
            {canAccept
              ? TT_SETTLEMENT_TEXT.pendingHoDescription
              : TT_SETTLEMENT_TEXT.readonlyDescription}
          </p>
        </div>
        <TtSettlementForm readOnly isHo={isHo} />
        {document.rejectionReason ? (
          <p className="text-sm text-text-secondary">
            {`${TT_SETTLEMENT_TEXT.rejectReason}: ${document.rejectionReason}`}
          </p>
        ) : null}
        {document.cancellationReason ? (
          <p className="text-sm text-text-secondary">
            {`${TT_SETTLEMENT_TEXT.cancelReason}: ${document.cancellationReason}`}
          </p>
        ) : null}
      </div>
      <Modal
        open={confirmationAction !== null}
        onOpenChange={open => {
          if (!open) setConfirmationAction(null);
        }}
        title={
          confirmationAction === 'REJECT'
            ? TT_SETTLEMENT_TEXT.reject
            : TT_SETTLEMENT_TEXT.cancel
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmationAction(null)}
            >
              {TT_SETTLEMENT_TEXT.close}
            </Button>
            <Button
              type="button"
              loading={
                confirmationAction === 'REJECT'
                  ? rejectMutation.isPending
                  : cancelMutation.isPending
              }
              onClick={() => {
                if (!reason.trim()) {
                  toast.error(
                    confirmationAction === 'REJECT'
                      ? TT_SETTLEMENT_TEXT.rejectReasonRequired
                      : TT_SETTLEMENT_TEXT.cancelReasonRequired
                  );
                  return;
                }
                if (confirmationAction === 'REJECT') {
                  void run(
                    rejectMutation.mutateAsync({ id, reason: reason.trim() }),
                    TT_SETTLEMENT_TEXT.rejected
                  );
                  return;
                }
                void run(
                  cancelMutation.mutateAsync({ id, reason: reason.trim() }),
                  TT_SETTLEMENT_TEXT.cancelled
                );
              }}
            >
              {TT_SETTLEMENT_TEXT.confirm}
            </Button>
          </div>
        }
      >
        <FormFieldTextarea
          name="actionReason"
          label={
            confirmationAction === 'REJECT'
              ? TT_SETTLEMENT_TEXT.rejectReason
              : TT_SETTLEMENT_TEXT.cancelReason
          }
          value={reason}
          onChange={event => setReason(event.target.value)}
          rows={4}
        />
      </Modal>
    </Form>
  );
};

export default TtSettlementEditView;
