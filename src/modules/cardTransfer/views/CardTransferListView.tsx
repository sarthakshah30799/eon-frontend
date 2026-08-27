import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table';
import { Form, FormFieldInput } from '@/components/forms';
import { Loader } from '@/components/ui/loader';
import { formatDateTime } from '@/utils';
import { CARD_TRANSFER_STATUS_OPTIONS, CARD_TRANSFER_COPY } from '../constants';
import { useListCardTransfers } from '../hooks';
import type { CardTransferRequest } from '../types';

export const CardTransferListView = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const {
    data: requests = [],
    isLoading,
    error,
  } = useListCardTransfers({
    status: status === 'ALL' ? undefined : status,
    search: search.trim() || undefined,
  });
  const data = useMemo(() => requests, [requests]);
  const columns = useMemo<TableColumnDef<CardTransferRequest>[]>(
    () => [
      { accessorKey: 'transactionNumber', header: 'Transaction Number' },
      { id: 'type', header: 'Type', cell: () => 'CARD Transfer Sell' },
      {
        accessorKey: 'transactionDate',
        header: 'Transaction Date',
        cell: ({ row }) =>
          formatDateTime(
            `${row.original.transactionDate}T00:00:00`,
            'DD/MM/YYYY'
          ),
      },
      {
        accessorKey: 'sourceBranchId',
        header: 'Source HO Branch',
        cell: ({ row }) =>
          row.original.sourceBranch?.name ?? row.original.sourceBranchId,
      },
      {
        accessorKey: 'destinationBranchId',
        header: 'Destination Branch',
        cell: ({ row }) =>
          row.original.destinationBranch?.name ??
          row.original.destinationBranchId,
      },
      { accessorKey: 'status', header: 'Status' },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => navigate(`/card-transfer/edit/${row.original.id}`)}
          >
            {row.original.status === 'HELD' ? 'Edit / Review' : 'View'}
          </Button>
        ),
      },
    ],
    [navigate]
  );
  if (isLoading) return <Loader />;
  if (error instanceof Error)
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-700">
        {error.message}
      </div>
    );
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            {CARD_TRANSFER_COPY.listTitle}
          </h1>
          <p className="text-sm text-text-secondary">
            {CARD_TRANSFER_COPY.listDescription}
          </p>
        </div>
        <Button type="button" onClick={() => navigate('/card-transfer/create')}>
          New CARD Transfer Sell
        </Button>
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <Form
          defaultValues={{ search }}
          onSubmit={() => undefined}
          className="min-w-[260px] flex-1"
        >
          <FormFieldInput
            name="search"
            label="Search CARD transfers"
            placeholder="Search transaction or branch"
            valueTransform="none"
            onChange={event => setSearch(event.target.value)}
          />
        </Form>
        <div className="flex flex-wrap gap-2">
          {CARD_TRANSFER_STATUS_OPTIONS.map(option => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={status === option.value ? 'default' : 'outline'}
              onClick={() => setStatus(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <Table
          columns={columns}
          data={data}
          enableSorting={false}
          enableFiltering={false}
          enablePagination={false}
          emptyMessage="No CARD transfer requests found."
        />
      </section>
    </div>
  );
};

export default CardTransferListView;
