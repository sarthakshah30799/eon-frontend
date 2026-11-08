import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  SurfacePanel,
  CardSection,
  Breadcrumb,
  Badge,
} from '@/components/ui';
import { useListCompanyProfiles } from '@/modules/companyProfile/hooks';
import { formatDateTime, toDisplayDate } from '@/utils';
import { toast } from 'react-hot-toast';
import {
  useAdvanceAdjustment,
  useRecordAdvanceAdjustmentPrint,
} from '../hooks';
import { AdvanceAdjustmentStatus, type AdvanceAdjustmentItem } from '../types';
import {
  ADVANCE_ADJUSTMENT_PRINT_TEXT,
  ADVANCE_ADJUSTMENT_TEXT,
} from '../constants';
import {
  buildAdvanceAdjustmentPrintHtml,
  getAdvanceAdjustmentPrintCopyLabel,
  getAdvanceAdjustmentPrintCopyType,
  openPrintWindow,
} from '../utils/advanceAdjustmentPrintUtils';

export const AdvanceAdjustmentDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: record, isLoading, error } = useAdvanceAdjustment(id || '');
  const recordPrintMutation = useRecordAdvanceAdjustmentPrint();
  const { data: companiesPage } = useListCompanyProfiles(
    { limit: 1, offset: 0 },
    record?.status === AdvanceAdjustmentStatus.COMPLETED
  );
  const company = companiesPage?.data?.[0] ?? null;

  const [isPrinting, setIsPrinting] = useState(false);
  const [hasPrintedOnce, setHasPrintedOnce] = useState(false);

  const canPrint = record?.status === AdvanceAdjustmentStatus.COMPLETED;
  const printCopyType = getAdvanceAdjustmentPrintCopyType(
    hasPrintedOnce ? Math.max(record?.printCount ?? 0, 1) : record?.printCount
  );

  const handlePrintCopy = async () => {
    if (!record?.id || !canPrint || isPrinting) {
      return;
    }

    try {
      setIsPrinting(true);
      const copyType = getAdvanceAdjustmentPrintCopyType(record.printCount);
      const html = buildAdvanceAdjustmentPrintHtml({
        copyType,
        record,
        company,
      });
      await recordPrintMutation.mutateAsync({
        id: record.id,
        payload: {
          copyType,
          subject: `${record.number} - ${getAdvanceAdjustmentPrintCopyLabel(copyType)}`,
          text: `Printed ${getAdvanceAdjustmentPrintCopyLabel(copyType).toLowerCase()} for advance adjustment ${record.number}.`,
          html,
          sendEmail: false,
        },
      });
      openPrintWindow(html, ADVANCE_ADJUSTMENT_PRINT_TEXT.popupBlocked);
      setHasPrintedOnce(true);
      toast.success(
        ADVANCE_ADJUSTMENT_PRINT_TEXT.printed(
          getAdvanceAdjustmentPrintCopyLabel(copyType)
        )
      );
    } catch (printError) {
      toast.error(
        printError instanceof Error
          ? printError.message
          : ADVANCE_ADJUSTMENT_PRINT_TEXT.printFailed
      );
    } finally {
      setIsPrinting(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    {
      label: ADVANCE_ADJUSTMENT_TEXT.BREADCRUMB_LIST,
      href: '/advance-adjustments',
    },
    {
      label: record?.number || ADVANCE_ADJUSTMENT_TEXT.BREADCRUMB_DETAIL,
      active: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="py-12 text-center text-text-secondary">
        Loading advance adjustment details...
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="py-12 text-center text-error-600">
        Failed to load advance adjustment details.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <SurfacePanel className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-primary">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-text-primary">
                {record.number}
              </h1>
              <Badge
                variant={
                  record.status === AdvanceAdjustmentStatus.COMPLETED
                    ? 'success'
                    : 'default'
                }
              >
                {record.status}
              </Badge>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              Transaction Date:{' '}
              <span className="font-medium text-text-primary">
                {toDisplayDate(record.transactionDate) ||
                  record.transactionDate}
              </span>{' '}
              | As-on Date:{' '}
              <span className="font-medium text-text-primary">
                {toDisplayDate(record.asOnDate) || record.asOnDate}
              </span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/advance-adjustments')}
              >
                Back to List
              </Button>
              {canPrint && (
                <Button
                  variant="default"
                  onClick={() => {
                    void handlePrintCopy();
                  }}
                  disabled={isPrinting || recordPrintMutation.isPending}
                >
                  {ADVANCE_ADJUSTMENT_TEXT.PRINT_COPY}
                </Button>
              )}
            </div>
            {canPrint && (
              <p className="text-xs text-text-secondary">
                {printCopyType === 'DUPLICATE_COPY'
                  ? ADVANCE_ADJUSTMENT_TEXT.PRINT_DUPLICATE_HINT
                  : ADVANCE_ADJUSTMENT_TEXT.PRINT_ORIGINAL_HINT}
              </p>
            )}
            {(record.printLogs?.length ?? 0) > 0 ? (
              <div className="max-w-sm text-right">
                <p className="text-xs font-medium text-text-secondary">
                  {ADVANCE_ADJUSTMENT_TEXT.PRINT_HISTORY}
                </p>
                <ul className="mt-1 space-y-1 text-xs text-text-secondary">
                  {record.printLogs?.map(log => (
                    <li key={log.id}>
                      {log.performedByName?.trim() ||
                        ADVANCE_ADJUSTMENT_TEXT.PRINTED_BY_UNKNOWN}
                      {' · '}
                      {getAdvanceAdjustmentPrintCopyLabel(log.copyType)}
                      {' · '}
                      {formatDateTime(log.performedAt)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <CardSection heading="Workplace & Party">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-text-secondary">Branch:</dt>
              <dd className="font-medium text-text-primary">
                {record.branchSnapshot?.name || '-'} (
                {record.branchSnapshot?.code || '-'})
              </dd>
              <dt className="text-text-secondary">Counter:</dt>
              <dd className="font-medium text-text-primary">
                {record.counterSnapshot?.counterName || '-'}
              </dd>
              <dt className="text-text-secondary">Party Name:</dt>
              <dd className="font-medium text-text-primary">
                {record.partyProfileSnapshot?.name || '-'}
              </dd>
              <dt className="text-text-secondary">Party Code:</dt>
              <dd className="font-medium text-text-primary">
                {record.partyProfileSnapshot?.code || '-'}
              </dd>
              <dt className="text-text-secondary">PAN Number:</dt>
              <dd className="font-medium text-text-primary">
                {record.panNumber || '-'}
              </dd>
              <dt className="text-text-secondary">PAN Name:</dt>
              <dd className="font-medium text-text-primary">
                {record.panName || '-'}
              </dd>
              <dt className="text-text-secondary">Total Amount:</dt>
              <dd className="font-medium text-text-primary">
                ₹
                {Number(record.totalAdjustmentAmount).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </dd>
              <dt className="text-text-secondary">Narration:</dt>
              <dd className="font-medium text-text-primary col-span-2">
                {record.narration}
              </dd>
              <dt className="text-text-secondary">Created:</dt>
              <dd className="font-medium text-text-primary">
                {formatDateTime(record.createdAt)}
              </dd>
            </dl>
          </CardSection>
        </div>

        <CardSection heading="Adjusted Sales">
          <div className="overflow-x-auto border border-border-primary rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-surface-secondary text-left text-text-secondary">
                <tr>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Sale No</th>
                  <th className="px-4 py-3 font-medium">Sale Date</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium text-right">
                    Final (₹)
                  </th>
                  <th className="px-4 py-3 font-medium text-right">
                    Outstanding (₹)
                  </th>
                  <th className="px-4 py-3 font-medium text-right">
                    Adjusted (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {(record.items || []).map((item: AdvanceAdjustmentItem) => (
                  <tr
                    key={item.id}
                    className="border-t border-border-primary"
                  >
                    <td className="px-4 py-3">{item.lineNo}</td>
                    <td className="px-4 py-3">
                      {item.transactionSnapshot?.number || '-'}
                    </td>
                    <td className="px-4 py-3">
                      {toDisplayDate(
                        item.transactionSnapshot?.transactionDate
                      ) ||
                        item.transactionSnapshot?.transactionDate ||
                        '-'}
                    </td>
                    <td className="px-4 py-3">
                      {item.transactionSnapshot?.slug ||
                        item.transactionSnapshot?.transactionType ||
                        '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {Number(item.finalAmount).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {Number(item.outstandingAmount).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {Number(item.adjustmentAmount).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
                {!(record.items || []).length && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-text-secondary"
                    >
                      {ADVANCE_ADJUSTMENT_TEXT.EMPTY_ITEMS}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardSection>
      </SurfacePanel>
    </div>
  );
};
