import { useCallback, useMemo, useRef, useState } from 'react';
import type { RowSelectionState } from '@tanstack/react-table';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Button,
  Checkbox,
  Label,
  Modal,
  Table,
  type AsyncSelectOption,
  type TableColumnDef,
} from '@/components/ui';
import {
  buildStaticAsyncSelectToolbarFilter,
  TableToolbar,
} from '@/components/ui/table';
import { Loader } from '@/components/ui/loader';
import { useOffsetPaginatedList } from '@/hooks';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { formatDateTime } from '@/utils';
import {
  DealCoverStatus,
  dealCoverRateApi,
  type IDealCoverRate,
} from '@/api/dealCoverRate';
import {
  useApproveDealCoverRate,
  useRejectDealCoverRate,
} from '@/modules/dealCoverRate/hooks';
import {
  groupDealsByCurrency,
  snapshotLabel,
} from '@/modules/dealCoverRate/utils';
import {
  DEAL_COVER_STATUS_FILTER_OPTIONS,
  readDealCoverStatusFromSearchParams,
  resolveDealCoverStatusDropdownValue,
} from '@/modules/dealCoverRate/constants';
import { DEAL_COVER_ACK_TEXT } from '../constants';

type AckRowDraft = {
  dealNo: string;
  bookingRate: string;
};

type ConfirmationAction = 'APPROVE' | 'REJECT' | null;

type AckDraftField = keyof AckRowDraft;

const emptyDraft = (): AckRowDraft => ({
  dealNo: '',
  bookingRate: '',
});

/** Local-state input so table column remounts / parent re-renders do not steal focus. */
const AckDraftInput = ({
  dealId,
  field,
  initialValue,
  placeholder,
  disabled,
  onCommit,
}: {
  dealId: string;
  field: AckDraftField;
  initialValue: string;
  placeholder: string;
  disabled: boolean;
  onCommit: (dealId: string, field: AckDraftField, value: string) => void;
}) => {
  const [value, setValue] = useState(initialValue);

  return (
    <input
      className="min-w-36 w-full rounded-sm border border-border-primary bg-surface-primary px-2 py-1.5 text-sm"
      placeholder={placeholder}
      value={value}
      disabled={disabled}
      onChange={event => {
        const next = event.target.value;
        setValue(next);
        onCommit(dealId, field, next);
      }}
      onKeyDown={event => {
        if (event.key === 'Enter') {
          event.preventDefault();
        }
      }}
    />
  );
};

export const DealCoverAckView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = useMemo(
    () => readDealCoverStatusFromSearchParams(searchParams),
    [searchParams]
  );
  const filters = useMemo(
    () => ({
      status: status || undefined,
    }),
    [status]
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const draftsRef = useRef<Record<string, AckRowDraft>>({});
  const [confirmationAction, setConfirmationAction] =
    useState<ConfirmationAction>(null);
  const [reason, setReason] = useState('');
  const approveMutation = useApproveDealCoverRate();
  const rejectMutation = useRejectDealCoverRate();

  const resetOffsetParams = useCallback((next: URLSearchParams) => {
    next.set('offset', String(PAGINATION_DEFAULTS.OFFSET));
    if (!next.has('limit')) {
      next.set('limit', String(PAGINATION_DEFAULTS.LIMIT));
    }
    return next;
  }, []);

  const handleStatusChange = useCallback(
    (option: AsyncSelectOption | null) => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        const value = String(option?.value ?? 'ALL').trim();
        if (!value || value === 'ALL') {
          next.delete('status');
        } else {
          next.set('status', value);
        }
        return resetOffsetParams(next);
      });
    },
    [resetOffsetParams, setSearchParams]
  );

  const {
    rows,
    isLoading,
    isFetching,
    error,
    page,
    limit,
    total,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
  } = useOffsetPaginatedList({
    queryKey: ['tt-deal', 'covers', 'acknowledgement'],
    queryFn: params => dealCoverRateApi.listForAck(params),
    filters,
  });

  const groups = useMemo(() => groupDealsByCurrency(rows), [rows]);
  const selectedIds = useMemo(
    () => Object.keys(rowSelection).filter(id => rowSelection[id]),
    [rowSelection]
  );
  const isActionPending =
    approveMutation.isPending || rejectMutation.isPending;

  const commitDraft = useCallback(
    (id: string, field: AckDraftField, value: string) => {
      const current = draftsRef.current[id] ?? emptyDraft();
      draftsRef.current[id] = {
        ...current,
        [field]: value,
      };
    },
    []
  );

  const runApprove = async () => {
    if (selectedIds.length === 0) {
      toast.error(DEAL_COVER_ACK_TEXT.noneSelected);
      return;
    }
    for (const id of selectedIds) {
      const draft = draftsRef.current[id] ?? emptyDraft();
      const dealNo = draft.dealNo.trim();
      const bookingRate = draft.bookingRate.trim();
      if (!dealNo || !bookingRate) {
        toast.error(DEAL_COVER_ACK_TEXT.incompleteRows);
        return;
      }
    }
    for (const id of selectedIds) {
      const draft = draftsRef.current[id] ?? emptyDraft();
      await approveMutation.mutateAsync({
        id,
        payload: {
          dealNo: draft.dealNo.trim(),
          bookingRate: draft.bookingRate.trim(),
        },
      });
    }
    toast.success(DEAL_COVER_ACK_TEXT.approved);
    setRowSelection({});
    setConfirmationAction(null);
  };

  const runReject = async () => {
    if (selectedIds.length === 0) {
      toast.error(DEAL_COVER_ACK_TEXT.noneSelected);
      return;
    }
    if (!reason.trim()) {
      toast.error(DEAL_COVER_ACK_TEXT.rejectReasonRequired);
      return;
    }
    for (const id of selectedIds) {
      await rejectMutation.mutateAsync({
        id,
        payload: { reason: reason.trim() },
      });
    }
    toast.success(DEAL_COVER_ACK_TEXT.rejected);
    setRowSelection({});
    setReason('');
    setConfirmationAction(null);
  };

  const toolbarFilters = useMemo(
    () => [
      buildStaticAsyncSelectToolbarFilter({
        id: 'status',
        label: DEAL_COVER_ACK_TEXT.status,
        options: DEAL_COVER_STATUS_FILTER_OPTIONS,
        value: resolveDealCoverStatusDropdownValue(status),
        placeholder: 'All',
        className: 'min-w-40 shrink-0',
        onChange: handleStatusChange,
      }),
    ],
    [handleStatusChange, status]
  );

  const rowColumns = useMemo<TableColumnDef<IDealCoverRate>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <div className="flex justify-center">
            <Checkbox
              checked={table.getIsAllRowsSelected()}
              onChange={checked => table.toggleAllRowsSelected(checked)}
              aria-label={DEAL_COVER_ACK_TEXT.selectAll}
              className="shrink-0"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onChange={checked => row.toggleSelected(checked)}
              aria-label={`${DEAL_COVER_ACK_TEXT.select} ${row.original.transactionNumber}`}
              className="shrink-0"
              disabled={row.original.status !== DealCoverStatus.PENDING}
            />
          </div>
        ),
        enableSorting: false,
        meta: {
          headerClassName: 'w-14',
          cellClassName: 'w-14',
        },
      },
      {
        accessorKey: 'transactionDate',
        header: 'Date',
        cell: ({ row }) =>
          formatDateTime(row.original.transactionDate, 'DD/MM/YYYY'),
      },
      {
        accessorKey: 'transactionNumber',
        header: DEAL_COVER_ACK_TEXT.transactionNumber,
      },
      {
        id: 'branch',
        header: DEAL_COVER_ACK_TEXT.branch,
        cell: ({ row }) =>
          snapshotLabel(row.original.branchSnapshot, row.original.branchId),
      },
      {
        id: 'issuer',
        header: DEAL_COVER_ACK_TEXT.issuer,
        cell: ({ row }) =>
          snapshotLabel(
            row.original.issuerPartyProfileSnapshot,
            row.original.issuerPartyProfileId
          ),
      },
      {
        id: 'passenger',
        header: DEAL_COVER_ACK_TEXT.passenger,
        cell: ({ row }) => row.original.passengerName ?? '-',
      },
      {
        accessorKey: 'feAmount',
        header: DEAL_COVER_ACK_TEXT.feAmount,
      },
      {
        accessorKey: 'dealRate',
        header: DEAL_COVER_ACK_TEXT.dealRate,
      },
      {
        id: 'dealNo',
        header: DEAL_COVER_ACK_TEXT.dealNo,
        meta: {
          headerClassName: 'min-w-40',
          cellClassName: 'min-w-40',
        },
        cell: ({ row }) => (
          <AckDraftInput
            dealId={row.original.id}
            field="dealNo"
            initialValue={draftsRef.current[row.original.id]?.dealNo ?? ''}
            placeholder="Deal no"
            disabled={row.original.status !== DealCoverStatus.PENDING}
            onCommit={commitDraft}
          />
        ),
      },
      {
        id: 'bookingRate',
        header: DEAL_COVER_ACK_TEXT.bookingRate,
        meta: {
          headerClassName: 'min-w-40',
          cellClassName: 'min-w-40',
        },
        cell: ({ row }) => (
          <AckDraftInput
            dealId={row.original.id}
            field="bookingRate"
            initialValue={
              draftsRef.current[row.original.id]?.bookingRate ?? ''
            }
            placeholder="Booking rate"
            disabled={row.original.status !== DealCoverStatus.PENDING}
            onCommit={commitDraft}
          />
        ),
      },
      {
        id: 'actions',
        header: DEAL_COVER_ACK_TEXT.view,
        cell: ({ row }) => (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              navigate(`/deal-cover-rate/view/${row.original.id}`)
            }
          >
            {DEAL_COVER_ACK_TEXT.view}
          </Button>
        ),
      },
    ],
    [commitDraft, navigate]
  );

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            {DEAL_COVER_ACK_TEXT.title}
          </h1>
          <p className="text-sm text-text-secondary">
            {DEAL_COVER_ACK_TEXT.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isActionPending || selectedIds.length === 0}
            onClick={() => {
              setReason('');
              setConfirmationAction('REJECT');
            }}
          >
            {DEAL_COVER_ACK_TEXT.reject}
          </Button>
          <Button
            type="button"
            disabled={isActionPending || selectedIds.length === 0}
            onClick={() => setConfirmationAction('APPROVE')}
          >
            {DEAL_COVER_ACK_TEXT.approve}
          </Button>
        </div>
      </div>

      <TableToolbar filters={toolbarFilters} />

      {groups.length === 0 ? (
        <section className="rounded-sm border border-border-primary bg-surface-primary p-6 text-sm text-text-secondary">
          {error instanceof Error ? error.message : DEAL_COVER_ACK_TEXT.empty}
        </section>
      ) : (
        groups.map(group => (
          <section
            key={group.currencyId}
            className="space-y-3 rounded-sm border border-border-primary bg-surface-primary p-3 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-text-primary">
                {`${DEAL_COVER_ACK_TEXT.currencyGroup}: ${snapshotLabel(group.currencySnapshot, group.currencyId)}`}
              </h2>
              <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                <span>
                  {`${DEAL_COVER_ACK_TEXT.groupTotalFe}: ${group.totalFeAmount}`}
                </span>
                <span>
                  {`${DEAL_COVER_ACK_TEXT.groupAvgRate}: ${group.weightedAvgDealRate}`}
                </span>
                <span>
                  {`${DEAL_COVER_ACK_TEXT.groupTotalInr}: ${group.totalInrAmount}`}
                </span>
              </div>
            </div>
            <Table
              columns={rowColumns}
              data={group.items}
              loading={false}
              isFetching={isFetching}
              enableFiltering={false}
              enablePagination={false}
              enableRowSelection
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              getRowId={deal => deal.id}
              emptyMessage={DEAL_COVER_ACK_TEXT.empty}
            />
          </section>
        ))
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-text-secondary">
        <span>
          {`Page ${page} of ${Math.max(totalPages, 1)} · ${total} deals`}
        </span>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
          >
            Previous
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            Next
          </Button>
          <select
            className="rounded-sm border border-border-primary bg-surface-primary px-2 py-1"
            value={limit}
            onChange={event => handlePageSizeChange(Number(event.target.value))}
          >
            {[10, 25, 50, 100].map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Modal
        open={confirmationAction !== null}
        onOpenChange={open => {
          if (!open) setConfirmationAction(null);
        }}
        title={
          confirmationAction === 'REJECT'
            ? DEAL_COVER_ACK_TEXT.reject
            : DEAL_COVER_ACK_TEXT.approve
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmationAction(null)}
            >
              {DEAL_COVER_ACK_TEXT.close}
            </Button>
            <Button
              type="button"
              loading={isActionPending}
              onClick={() => {
                if (confirmationAction === 'REJECT') {
                  void runReject();
                  return;
                }
                void runApprove();
              }}
            >
              {DEAL_COVER_ACK_TEXT.confirm}
            </Button>
          </div>
        }
      >
        {confirmationAction === 'REJECT' ? (
          <div className="space-y-2">
            <Label htmlFor="rejectReason">
              {DEAL_COVER_ACK_TEXT.rejectReason}
            </Label>
            <textarea
              id="rejectReason"
              className="block w-full rounded-md border border-border-secondary bg-surface-primary px-3 py-2 text-text-primary"
              value={reason}
              onChange={event => setReason(event.target.value)}
              rows={4}
            />
          </div>
        ) : (
          <p className="text-sm text-text-secondary">
            {`Approve ${selectedIds.length} selected deal(s) with the entered deal numbers and booking rates?`}
          </p>
        )}
      </Modal>
    </div>
  );
};

export default DealCoverAckView;
