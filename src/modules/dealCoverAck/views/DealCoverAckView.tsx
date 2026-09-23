import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button, Label, Modal, Table, type TableColumnDef } from '@/components/ui';
import { Loader } from '@/components/ui/loader';
import { useOffsetPaginatedList } from '@/hooks';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { formatDateTime } from '@/utils';
import {
  DealCoverStatus,
  dealCoverRateApi,
  type DealCoverRateListFilters,
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
import { DEAL_COVER_STATUS_OPTIONS } from '@/modules/dealCoverRate/constants';
import { DEAL_COVER_ACK_TEXT } from '../constants';

type AckRowDraft = {
  dealNo: string;
  bookingRate: string;
};

type ConfirmationAction = 'APPROVE' | 'REJECT' | null;

export const DealCoverAckView = () => {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<
    Omit<DealCoverRateListFilters, 'limit' | 'offset'>
  >({ status: DealCoverStatus.PENDING });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Record<string, AckRowDraft>>({});
  const [confirmationAction, setConfirmationAction] =
    useState<ConfirmationAction>(null);
  const [reason, setReason] = useState('');
  const approveMutation = useApproveDealCoverRate();
  const rejectMutation = useRejectDealCoverRate();

  const resetOffset = useCallback(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('offset', String(PAGINATION_DEFAULTS.OFFSET));
      if (!next.has('limit')) {
        next.set('limit', String(PAGINATION_DEFAULTS.LIMIT));
      }
      return next;
    });
  }, [setSearchParams]);

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
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const isActionPending =
    approveMutation.isPending || rejectMutation.isPending;

  const toggleId = (id: string) => {
    setSelectedIds(current =>
      current.includes(id)
        ? current.filter(item => item !== id)
        : [...current, id]
    );
  };

  const updateDraft = (
    id: string,
    field: keyof AckRowDraft,
    value: string
  ) => {
    setDrafts(current => ({
      ...current,
      [id]: {
        dealNo: current[id]?.dealNo ?? '',
        bookingRate: current[id]?.bookingRate ?? '',
        [field]: value,
      },
    }));
  };

  const runApprove = async () => {
    if (selectedIds.length === 0) {
      toast.error(DEAL_COVER_ACK_TEXT.noneSelected);
      return;
    }
    const incomplete = selectedIds.some(id => {
      const draft = drafts[id];
      return !draft?.dealNo?.trim() || !draft?.bookingRate?.trim();
    });
    if (incomplete) {
      toast.error(DEAL_COVER_ACK_TEXT.incompleteRows);
      return;
    }
    for (const id of selectedIds) {
      const draft = drafts[id];
      await approveMutation.mutateAsync({
        id,
        payload: {
          dealNo: draft.dealNo.trim(),
          bookingRate: draft.bookingRate.trim(),
        },
      });
    }
    toast.success(DEAL_COVER_ACK_TEXT.approved);
    setSelectedIds([]);
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
    setSelectedIds([]);
    setReason('');
    setConfirmationAction(null);
  };

  const rowColumns = useMemo<TableColumnDef<IDealCoverRate>[]>(
    () => [
      {
        id: 'select',
        header: '',
        cell: ({ row }) => (
          <Button
            type="button"
            size="sm"
            variant={selectedSet.has(row.original.id) ? 'default' : 'outline'}
            onClick={() => toggleId(row.original.id)}
          >
            {selectedSet.has(row.original.id)
              ? DEAL_COVER_ACK_TEXT.selected
              : DEAL_COVER_ACK_TEXT.select}
          </Button>
        ),
      },
      {
        accessorKey: 'transactionDate',
        header: 'Date',
        cell: ({ row }) =>
          formatDateTime(row.original.transactionDate, 'DD/MM/YYYY'),
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
        cell: ({ row }) => (
          <input
            className="w-full rounded-sm border border-border-primary bg-surface-primary px-2 py-1 text-sm"
            value={drafts[row.original.id]?.dealNo ?? ''}
            onChange={event =>
              updateDraft(row.original.id, 'dealNo', event.target.value)
            }
            disabled={row.original.status !== DealCoverStatus.PENDING}
          />
        ),
      },
      {
        id: 'bookingRate',
        header: DEAL_COVER_ACK_TEXT.bookingRate,
        cell: ({ row }) => (
          <input
            className="w-full rounded-sm border border-border-primary bg-surface-primary px-2 py-1 text-sm"
            value={drafts[row.original.id]?.bookingRate ?? ''}
            onChange={event =>
              updateDraft(row.original.id, 'bookingRate', event.target.value)
            }
            disabled={row.original.status !== DealCoverStatus.PENDING}
          />
        ),
      },
      {
        id: 'view',
        header: '',
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
    [drafts, navigate, selectedSet]
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

      <div className="flex flex-wrap gap-2">
        {DEAL_COVER_STATUS_OPTIONS.map(option => (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={
              (filters.status ?? 'ALL') === option.value ? 'default' : 'outline'
            }
            onClick={() => {
              setFilters(current => ({
                ...current,
                status:
                  option.value === 'ALL'
                    ? undefined
                    : (option.value as typeof DealCoverStatus.PENDING),
              }));
              resetOffset();
            }}
          >
            {option.label}
          </Button>
        ))}
      </div>

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
