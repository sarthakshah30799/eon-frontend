import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  SurfacePanel,
  CardSection,
  Breadcrumb,
  Badge,
} from '@/components/ui';
import { formatDateTime, toDisplayDate } from '@/utils';
import { useAdvanceAdjustment } from '../hooks';
import { AdvanceAdjustmentStatus, type AdvanceAdjustmentItem } from '../types';
import { ADVANCE_ADJUSTMENT_TEXT } from '../constants';

export const AdvanceAdjustmentDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: record, isLoading, error } = useAdvanceAdjustment(id || '');

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

          <Button
            variant="outline"
            onClick={() => navigate('/advance-adjustments')}
          >
            Back to List
          </Button>
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
                    <td className="px-4 py-3 font-medium">
                      {item.transactionSnapshot?.number || item.transactionId}
                    </td>
                    <td className="px-4 py-3">
                      {toDisplayDate(
                        String(item.transactionSnapshot?.transactionDate || '')
                      ) ||
                        item.transactionSnapshot?.transactionDate ||
                        '-'}
                    </td>
                    <td className="px-4 py-3">
                      {item.transactionSnapshot?.slug || '-'}
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
                    <td className="px-4 py-3 text-right font-medium">
                      {Number(item.adjustmentAmount).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardSection>
      </SurfacePanel>
    </div>
  );
};
