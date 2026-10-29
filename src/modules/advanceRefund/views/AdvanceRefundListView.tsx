import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  SurfacePanel,
  Badge,
  PaginationControls,
  AsyncSelect,
  DatePicker,
  Input,
} from '@/components/ui';
import { useAuth } from '@/lib/AuthContext';
import { useLoadBranchOptions } from '@/modules/branchProfile/hooks';
import { useAdvanceRefundList } from '../hooks';
import {
  AdvanceRefundStatus,
  AdvanceRefundType,
  type AdvanceRefund,
} from '../types';
import {
  ADVANCE_REFUND_TEXT,
  ADVANCE_REFUND_TYPE_OPTIONS,
} from '../constants';
import { formatDateTime } from '@/utils';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: AdvanceRefundStatus.PENDING_HO_APPROVAL, label: 'Pending HO Payout' },
  { value: AdvanceRefundStatus.COMPLETED, label: 'Completed' },
  { value: AdvanceRefundStatus.DRAFT, label: 'Draft' },
  { value: AdvanceRefundStatus.CANCELLED, label: 'Cancelled' },
];

const getStatusBadge = (status: AdvanceRefundStatus) => {
  switch (status) {
    case AdvanceRefundStatus.COMPLETED:
      return <Badge variant="success">Completed</Badge>;
    case AdvanceRefundStatus.PENDING_HO_APPROVAL:
      return <Badge variant="warning">Pending HO Payout</Badge>;
    case AdvanceRefundStatus.CANCELLED:
      return <Badge variant="error">Cancelled</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
};

export const AdvanceRefundListView: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeBranchId } = useAuth();
  const canSelectBranch = Boolean(user?.isHo || user?.isHoStaff);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [branchId, setBranchId] = useState(canSelectBranch ? '' : activeBranchId || '');
  const [refundType, setRefundType] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [search, setSearch] = useState<string>('');

  const loadBranchOptions = useLoadBranchOptions({ activeOnly: true });

  const { data: response, isLoading } = useAdvanceRefundList({
    limit: pageSize,
    offset: (page - 1) * pageSize,
    branchId: branchId || undefined,
    refundType: (refundType as AdvanceRefundType) || undefined,
    status: (status as AdvanceRefundStatus) || undefined,
    dateFrom: dateFrom ? dateFrom.toISOString().slice(0, 10) : undefined,
    dateTo: dateTo ? dateTo.toISOString().slice(0, 10) : undefined,
    search: search || undefined,
  });

  const records = response?.data || [];
  const total = response?.total || 0;

  return (
    <SurfacePanel className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">
            {ADVANCE_REFUND_TEXT.TITLE}
          </h1>
          <p className="text-sm text-text-secondary">
            Manage advance refunds and knock-offs against customer receipts.
          </p>
        </div>
        <Button
          variant="default"
          onClick={() => navigate('/advance-refunds/create')}
        >
          {ADVANCE_REFUND_TEXT.CREATE_TITLE}
        </Button>
      </div>

      {/* Filters */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 p-4 bg-surface-secondary rounded-lg border border-border-primary">
        {canSelectBranch && (
          <AsyncSelect
            label="Branch"
            placeholder="All Branches"
            loadOptions={loadBranchOptions}
            defaultOptions={true}
            isClearable
            value={branchId ? { value: branchId, label: 'Selected Branch' } : null}
            onChange={val => {
              const opt = val as { value: string; label: string } | null;
              setBranchId(opt?.value || '');
              setPage(1);
            }}
          />
        )}
        <AsyncSelect
          label="Refund Type"
          placeholder="All Types"
          loadOptions={async (input: string) => ({
            options: [{ value: '', label: 'All Types' }, ...ADVANCE_REFUND_TYPE_OPTIONS].filter(
              o => !input || o.label.toLowerCase().includes(input.toLowerCase())
            ),
          })}
          defaultOptions={[{ value: '', label: 'All Types' }, ...ADVANCE_REFUND_TYPE_OPTIONS]}
          value={
            refundType
              ? ADVANCE_REFUND_TYPE_OPTIONS.find(o => o.value === refundType)
              : { value: '', label: 'All Types' }
          }
          onChange={val => {
            const opt = val as { value: string; label: string } | null;
            setRefundType(opt?.value || '');
            setPage(1);
          }}
        />
        <AsyncSelect
          label="Status"
          loadOptions={async (input: string) => ({
            options: STATUS_OPTIONS.filter(
              o => !input || o.label.toLowerCase().includes(input.toLowerCase())
            ),
          })}
          defaultOptions={STATUS_OPTIONS}
          value={
            status
              ? STATUS_OPTIONS.find(o => o.value === status)
              : { value: '', label: 'All Statuses' }
          }
          onChange={val => {
            const opt = val as { value: string; label: string } | null;
            setStatus(opt?.value || '');
            setPage(1);
          }}
        />
        <DatePicker
          label="Date From"
          placeholder="DD/MM/YYYY"
          dateFormat="dd/MM/yyyy"
          selected={dateFrom}
          onChange={d => {
            setDateFrom(d);
            setPage(1);
          }}
        />
        <DatePicker
          label="Date To"
          placeholder="DD/MM/YYYY"
          dateFormat="dd/MM/yyyy"
          selected={dateTo}
          onChange={d => {
            setDateTo(d);
            setPage(1);
          }}
        />
        <Input
          label="Search"
          placeholder="Number, Party, PAN..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border-primary rounded-md">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-surface-secondary text-text-secondary text-xs uppercase border-b border-border-primary">
            <tr>
              <th className="p-3 font-semibold text-text-primary">Number</th>
              <th className="p-3 font-semibold text-text-primary">Date</th>
              <th className="p-3 font-semibold text-text-primary">Branch</th>
              <th className="p-3 font-semibold text-text-primary">Party Name</th>
              <th className="p-3 font-semibold text-text-primary">Type</th>
              <th className="p-3 text-right font-semibold text-text-primary">Total Amount (₹)</th>
              <th className="p-3 font-semibold text-text-primary">Status</th>
              <th className="p-3 text-right font-semibold text-text-primary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-primary">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-text-secondary">
                  Loading advance refunds...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-text-secondary">
                  {ADVANCE_REFUND_TEXT.NO_RECORDS}
                </td>
              </tr>
            ) : (
              records.map((ar: AdvanceRefund) => (
                <tr key={ar.id} className="hover:bg-surface-secondary/50 transition-colors">
                  <td className="p-3 font-semibold text-text-primary">
                    {ar.number}
                  </td>
                  <td className="p-3">{formatDateTime(ar.transactionDate)}</td>
                  <td className="p-3">{ar.branchSnapshot?.name || '-'}</td>
                  <td className="p-3 max-w-[200px] truncate">
                    {ar.partyProfileSnapshot?.name || '-'}
                  </td>
                  <td className="p-3">
                    <Badge variant={ar.refundType === AdvanceRefundType.REFUND ? 'info' : 'default'}>
                      {ar.refundType}
                    </Badge>
                  </td>
                  <td className="p-3 text-right font-medium">
                    {Number(ar.totalRefundAmount).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-3">{getStatusBadge(ar.status)}</td>
                  <td className="p-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/advance-refunds/${ar.id}`)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <PaginationControls
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={Math.ceil(total / pageSize)}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemLabel="refunds"
        />
      )}
    </SurfacePanel>
  );
};
export default AdvanceRefundListView;
