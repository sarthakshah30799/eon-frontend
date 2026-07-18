import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table';
import { NotFoundState } from '@/components/ui/not-found-state';
import { usePermission } from '@/hooks/usePermission';
import { transactionAd1Api } from '@/api/transactionAd1/transactionAd1.api';
import { formatDateTime } from '@/utils';

interface Ad1Row {
  id: string;
  number: string;
  docNo: string;
  remitterName: string;
  transactionType: string;
  currencyId: string;
  fcVolume: string;
  createdAt: string;
}

export const AD1ListView = () => {
  const navigate = useNavigate();
  const { hasAnyPermission } = usePermission('/ad1');
  const [search, setSearch] = useState('');

  const { data = [], isLoading, isFetching, error } = useQuery({
    queryKey: ['transactions-ad1', search],
    queryFn: () => transactionAd1Api.getAll({ search: search.trim() || undefined }),
  });

  const rows = useMemo<Ad1Row[]>(
    () =>
      data.map(t => ({
        id: t.id,
        number: t.number ?? '-',
        docNo: t.docNo ?? '-',
        remitterName: t.remitterName ?? '-',
        transactionType: t.transactionType ?? '-',
        currencyId: t.currencyId ?? '-',
        fcVolume: t.fcVolume ?? '-',
        createdAt: formatDateTime(t.createdAt, true),
      })),
    [data]
  );

  const columns: TableColumnDef<Ad1Row>[] = useMemo(
    () => [
      { accessorKey: 'docNo', header: 'Doc No.' },
      { accessorKey: 'remitterName', header: 'Remitter Name' },
      { accessorKey: 'transactionType', header: 'Type' },
      { accessorKey: 'fcVolume', header: 'FC Volume' },
      { accessorKey: 'createdAt', header: 'Created At' },
      {
        id: 'actions',
        header: 'Actions',
        meta: {
          headerClassName: 'sticky right-0 z-20 border-l border-border-primary bg-surface-secondary',
          cellClassName: 'sticky right-0 z-10 border-l border-border-primary bg-surface-primary',
        },
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              aria-label="Edit AD1 transaction"
              variant="ghost"
              size="icon"
              className="rounded-sm bg-transparent text-black! hover:bg-surface-secondary hover:text-text-primary"
              onClick={e => {
                e.stopPropagation();
                navigate(`/ad1/edit/${row.original.id}`);
              }}
            >
              <PencilSquareIcon className="h-5 w-5" />
            </Button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [navigate]
  );

  if (!hasAnyPermission) {
    return <NotFoundState message="You do not have access to this page." />;
  }

  if (error) {
    return (
      <div className="py-8 text-center text-error-600">
        Failed to load AD1 transactions. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-text-primary">AD1 Transactions</h1>
          <p className="text-sm text-text-secondary">
            Browse and manage AD1 outward remittance transactions.
          </p>
        </div>
        <Button
          type="button"
          className="rounded-sm"
          onClick={() => navigate('/ad1/create')}
        >
          Create AD1
        </Button>
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <Table
          columns={columns}
          data={rows}
          loading={isLoading || isFetching}
          enableFiltering={false}
          enablePagination={false}
          enableColumnVisibility={false}
          enableRowSelection={false}
          enableSorting={false}
          onSearch={setSearch}
          searchValue={search}
          searchPlaceholder="Search by number"
          onRowClick={row => navigate(`/ad1/edit/${row.id}`)}
          emptyMessage="No AD1 transactions found."
        />
      </section>
    </div>
  );
};
