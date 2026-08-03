import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { Loader } from '@/components/ui/loader';
import { Table, type TableColumnDef } from '@/components/ui/table';
import { useAuth } from '@/lib/AuthContext';
import { useListTransfers } from '../hooks';
import { getTransferStatusLabel, TRANSFER_STATUS_OPTIONS } from '../utils';
import type { ICurrencyTransfer } from '../types';
import type { TransferType } from '../types';

const titleMap: Record<TransferType, string> = {
  COUNTER: 'Counter Transfers',
  BRANCH: 'Branch Transfers',
};

export const TransferListView = ({ transferType }: { transferType: TransferType }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminOrHo = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);
  const [status, setStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const queryParams = useMemo(
    () => ({
      transferType,
      status: status === 'ALL' ? undefined : (status as 'HELD' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'),
      search: search.trim() || undefined,
    }),
    [search, status, transferType]
  );

  const { data = [], isLoading, error } = useListTransfers(queryParams);
  const columns = useMemo<TableColumnDef<ICurrencyTransfer>[]>(
    () => [
      {
        accessorKey: 'number',
        header: 'Number',
        cell: ({ row }) => row.original.number ?? '—',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getTransferStatusLabel(row.original.status),
      },
      {
        accessorKey: 'billReference',
        header: 'Bill Ref',
        cell: ({ row }) => row.original.billReference ?? '—',
      },
      {
        accessorKey: 'sourceBranchId',
        header: 'Source',
        cell: ({ row }) => (
          <div>
            <div>{row.original.sourceBranch?.name ?? '—'}</div>
            <div className="text-xs text-text-secondary">
              {row.original.sourceCounter?.name ?? '—'}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'destinationBranchId',
        header: 'Destination',
        cell: ({ row }) => (
          <div>
            <div>{row.original.destinationBranch?.name ?? '—'}</div>
            <div className="text-xs text-text-secondary">
              {row.original.destinationCounter?.name ?? '—'}
            </div>
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button
            type="button"
            aria-label="View transfer"
            variant="ghost"
            size="icon"
            className="rounded-sm bg-transparent text-black! hover:bg-surface-secondary hover:text-text-primary"
            onClick={event => {
              event.stopPropagation();
              navigate(`/transfer/${transferType.toLowerCase()}/edit/${row.original.id}`);
            }}
          >
            <PencilSquareIcon className="h-5 w-5" />
          </Button>
        ),
      },
    ],
    [navigate, transferType]
  );

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-text-primary">
            {titleMap[transferType]}
          </h1>
          <p className="text-sm text-text-secondary">
            Browse held transfers and accept them when ready.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isAdminOrHo && (
            <div className="flex items-center gap-2 rounded-lg border border-border-primary bg-surface-secondary p-1">
              {TRANSFER_STATUS_OPTIONS.map(option => (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={status === option.value ? 'default' : 'outline'}
                  onClick={() => setStatus(option.value)}
                >
                  {option.value === 'ALL' ? 'All' : getTransferStatusLabel(option.value)}
                </Button>
              ))}
            </div>
          )}
          <Button
            type="button"
            className="rounded-sm"
            onClick={() => navigate(`/transfer/${transferType.toLowerCase()}/create`)}
          >
            New Transfer
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[240px] flex-1">
          <input
            type="text"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search transfer number"
            className="min-h-7.5 w-full rounded-md border border-border-secondary bg-surface-primary px-3 py-1 text-sm text-text-primary shadow-none transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <Table
          columns={columns}
          data={data}
          loading={isLoading}
          enableSorting={false}
          enableFiltering={false}
          enablePagination={false}
          emptyMessage="No transfers found."
        />
      </section>
    </div>
  );
};
