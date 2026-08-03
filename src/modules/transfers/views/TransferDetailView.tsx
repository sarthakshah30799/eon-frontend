import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Loader } from '@/components/ui/loader';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/AuthContext';
import { useListCompanyProfiles } from '@/modules/companyProfile/hooks';
import { useAcceptTransfer, useGetTransfer, useRecordTransferPrint, useRejectTransfer } from '../hooks';
import {
  buildTransferPrintHtml,
  getTransferPrintCopyLabel,
} from '../utils';
import { canApproveTransfer } from '../utils';
import { TransferFormView } from './TransferFormView';
import { TransferApprovalActions } from '../components/TransferApprovalActions';
import { mapTransferToFormValues } from '../utils/transferFormUtils';

const buildReferenceOption = (
  id: string,
  relation?: { code?: string | number | null; name?: string | null; counterNo?: string | number | null } | null,
  snapshot?: { code?: string | null; name?: string | null; label?: string | null } | null,
) => ({
  value: id,
  label:
    snapshot?.label ??
    ([
      relation?.counterNo ?? relation?.code ?? snapshot?.code,
      relation?.name ?? snapshot?.name,
    ]
      .filter(value => value !== null && value !== undefined && String(value).trim())
      .join(' - ') || id),
});

export const TransferDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const { user, activeBranchId, activeCounterId } = useAuth();
  const { data: companies = [] } = useListCompanyProfiles();
  const { data, isLoading, error } = useGetTransfer(id ?? '');
  const [, setPrintRenderTick] = useState(0);
  const acceptTransfer = useAcceptTransfer();
  const rejectTransfer = useRejectTransfer();
  const recordTransferPrint = useRecordTransferPrint();
  const canUserApproveTransfer = canApproveTransfer({
    user,
    activeBranchId,
    activeCounterId,
    transfer: data,
  });
  const currentCompany = useMemo(() => {
    const now = new Date();

    return (
      companies.find(company => {
        const fromDate = company.fromDate ? new Date(company.fromDate) : null;
        const toDate = company.toDate ? new Date(company.toDate) : null;

        if (fromDate && now < fromDate) {
          return false;
        }

        if (toDate && now > toDate) {
          return false;
        }

        return true;
      }) ?? companies[0] ?? null
    );
  }, [companies]);
  const storedPrintCount = data?.id && typeof window !== 'undefined'
    ? window.localStorage.getItem(`transfer-print-count:${data.id}`)
    : null;
  const parsedPrintCount = Number(storedPrintCount ?? '0');
  const transferPrintCount = Number.isFinite(parsedPrintCount) ? parsedPrintCount : 0;
  const nextCopyType =
    transferPrintCount === 0 ? 'CUSTOMER_COPY' : 'DUPLICATE_COPY';
  const printButtonLabel = `Print ${getTransferPrintCopyLabel(nextCopyType)}`;

  const handlePrint = async () => {
    if (!data) {
      return;
    }

    if (data.status !== 'ACCEPTED') {
      return;
    }

    try {
      const html = buildTransferPrintHtml({
        copyType: nextCopyType,
        transfer: data,
        company: currentCompany,
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

      const printWindow = window.open('', '_blank', 'width=1200,height=900');
      if (!printWindow) {
        throw new Error('Unable to open print window. Please allow pop-ups and try again.');
      }

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
      window.setTimeout(() => {
        printWindow.print();
      }, 250);

      if (data.id) {
        window.localStorage.setItem(
          `transfer-print-count:${data.id}`,
          String(transferPrintCount + 1),
        );
        setPrintRenderTick(current => current + 1);
      }
    } catch (printError) {
      const message = printError instanceof Error ? printError.message : 'Failed to print transfer copy';
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
    return <div className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-700">{error.message}</div>;
  }

  if (!data) {
    return <div className="text-sm text-muted-foreground">Transfer not found.</div>;
  }

  return (
    <TransferFormView
      transferType={data.transferType}
      initialValues={mapTransferToFormValues(data)}
      readOnly
      showSubmit={false}
      onCancel={() => window.history.back()}
      readOnlyOptions={{
        sourceBranch: buildReferenceOption(data.sourceBranchId, data.sourceBranch, data.sourceBranchSnapshot),
        sourceCounter: buildReferenceOption(data.sourceCounterId, data.sourceCounter, data.sourceCounterSnapshot),
        destinationBranch: buildReferenceOption(data.destinationBranchId, data.destinationBranch, data.destinationBranchSnapshot),
        destinationCounter: buildReferenceOption(data.destinationCounterId, data.destinationCounter, data.destinationCounterSnapshot),
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
            disabled={data.status !== 'ACCEPTED'}
            onClick={() => void handlePrint()}
          >
            {printButtonLabel}
          </Button>
        </>
      }
    />
  );
};
