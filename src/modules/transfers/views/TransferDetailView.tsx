import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Loader } from '@/components/ui/loader';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/AuthContext';
import {
  useAcceptTransfer,
  useGetTransfer,
  useRecordTransferPrint,
  useRejectTransfer,
} from '../hooks';
import {
  buildTransferPrintHtml,
  getTransferPrintCopyLabel,
  getTransferPrintCopyType,
} from '../utils';
import { canApproveTransfer } from '../utils';
import { TransferFormView } from './TransferFormView';
import { TransferApprovalActions } from '../components/TransferApprovalActions';
import { mapTransferToFormValues } from '../utils/transferFormUtils';
import { TRANSFER_PRINT_TEXT } from '../constants/transferConstants';
import {
  openPrintWindow,
  toPrintBranch,
  toPrintCompany,
} from '@/modules/transactions/utils/printSnapshotUtils';

const buildReferenceOption = (
  id: string,
  relation?: {
    code?: string | number | null;
    name?: string | null;
    counterNo?: string | number | null;
  } | null,
  snapshot?: {
    code?: string | null;
    name?: string | null;
    label?: string | null;
  } | null
) => ({
  value: id,
  label:
    snapshot?.label ??
    ([
      relation?.counterNo ?? relation?.code ?? snapshot?.code,
      relation?.name ?? snapshot?.name,
    ]
      .filter(
        value => value !== null && value !== undefined && String(value).trim()
      )
      .join(' - ') ||
      id),
});

export const TransferDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const { user, activeBranchId, activeCounterId } = useAuth();
  const { data, isLoading, error } = useGetTransfer(id ?? '');
  const acceptTransfer = useAcceptTransfer();
  const rejectTransfer = useRejectTransfer();
  const recordTransferPrint = useRecordTransferPrint();
  const canUserApproveTransfer = canApproveTransfer({
    user,
    activeBranchId,
    activeCounterId,
    transfer: data,
  });
  const nextCopyType = getTransferPrintCopyType(data?.printCount);
  const printButtonLabel = recordTransferPrint.isPending
    ? TRANSFER_PRINT_TEXT.preparing
    : `Print ${getTransferPrintCopyLabel(nextCopyType)}`;

  const handlePrint = async () => {
    if (!data || data.status !== 'ACCEPTED') {
      return;
    }

    try {
      const html = buildTransferPrintHtml({
        copyType: nextCopyType,
        transfer: data,
        company: toPrintCompany(data.companySnapshot),
        branch: toPrintBranch(data.sourceBranchSnapshot),
      });

      await recordTransferPrint.recordTransferPrint({
        id: data.id,
        payload: {
          copyType: nextCopyType,
          sendEmail: true,
          subject: `${data.number ?? 'Transfer'} - ${getTransferPrintCopyLabel(nextCopyType)}`,
          text: `Printed ${getTransferPrintCopyLabel(nextCopyType).toLowerCase()} for transfer ${data.number ?? ''}.`,
          html,
        },
      });

      openPrintWindow(html, TRANSFER_PRINT_TEXT.popupBlocked);
      toast.success(
        TRANSFER_PRINT_TEXT.printed(getTransferPrintCopyLabel(nextCopyType))
      );
    } catch (printError) {
      const message =
        printError instanceof Error
          ? printError.message
          : TRANSFER_PRINT_TEXT.printFailed;
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error instanceof Error) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-700">
        {error.message}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-sm text-muted-foreground">Transfer not found.</div>
    );
  }

  return (
    <TransferFormView
      transferType={data.transferType}
      initialValues={mapTransferToFormValues(data)}
      readOnly
      showSubmit={false}
      onCancel={() => window.history.back()}
      readOnlyOptions={{
        sourceBranch: buildReferenceOption(
          data.sourceBranchId,
          data.sourceBranch,
          data.sourceBranchSnapshot
        ),
        sourceCounter: buildReferenceOption(
          data.sourceCounterId,
          data.sourceCounter,
          data.sourceCounterSnapshot
        ),
        destinationBranch: buildReferenceOption(
          data.destinationBranchId,
          data.destinationBranch,
          data.destinationBranchSnapshot
        ),
        destinationCounter: buildReferenceOption(
          data.destinationCounterId,
          data.destinationCounter,
          data.destinationCounterSnapshot
        ),
      }}
      footerActions={
        <>
          <TransferApprovalActions
            transferId={data.id}
            status={data.status}
            canApprove={canUserApproveTransfer}
            accepting={acceptTransfer.isPending}
            rejecting={rejectTransfer.isPending}
            onAccept={id => void acceptTransfer.acceptTransfer(id)}
            onReject={params => void rejectTransfer.rejectTransfer(params)}
          />
          <Button
            type="button"
            variant="outline"
            disabled={
              data.status !== 'ACCEPTED' || recordTransferPrint.isPending
            }
            onClick={() => void handlePrint()}
          >
            {printButtonLabel}
          </Button>
        </>
      }
    />
  );
};
