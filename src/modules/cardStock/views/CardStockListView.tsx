import { useNavigate } from 'react-router-dom';
import { EyeIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import {
  Table,
  type TableColumnDef,
  TABLE_ACTIONS_CELL_CLASSNAME,
  TABLE_ACTION_BUTTON_CLASSNAME,
  TABLE_ACTION_ICON_CLASSNAME,
} from '@/components/ui/table';
import { useOffsetPaginatedList } from '@/hooks';
import { cardStockApi } from '@/api/cardStock';
import { formatDateTime } from '@/utils';
import type { CardStockReceipt } from '../types';
import { SurfacePanel } from '@/components/ui';

export const CardStockListView = () => {
  const navigate = useNavigate();
  const {
    rows: data,
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
    queryKey: ['card-stock', 'receipts'],
    queryFn: params => cardStockApi.list(params),
  });

  const columns: TableColumnDef<CardStockReceipt>[] = [
    { accessorKey: 'transactionNumber', header: 'Transaction Number' },
    {
      accessorKey: 'receiptDate',
      header: 'Transaction Date',
      cell: ({ row }) =>
        formatDateTime(
          `${row.original.receiptDate?.slice(0, 10)}T00:00:00`,
          'DD/MM/YYYY'
        ),
    },
    {
      accessorKey: 'issuerPartyProfileId',
      header: 'Card Issuer',
      cell: ({ row }) =>
        row.original.issuerPartyProfileSnapshot?.name ??
        row.original.issuerPartyProfileId,
    },
    { accessorKey: 'totalFeAmount', header: 'Total FE Amount' },
    { accessorKey: 'status', header: 'Status' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className={TABLE_ACTIONS_CELL_CLASSNAME}>
          <Button
            type="button"
            aria-label="View card stock receipt"
            variant="ghost"
            size="icon"
            className={TABLE_ACTION_BUTTON_CLASSNAME}
            onClick={event => {
              event.stopPropagation();
              navigate(`/card-stock/edit/${row.original.id}`);
            }}
          >
            <EyeIcon className={TABLE_ACTION_ICON_CLASSNAME} />
          </Button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        {error instanceof Error
          ? error.message
          : 'Failed to load card stock receipts'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Receipt Stock
          </h1>
          <p className="text-sm text-text-secondary">
            Review CARD stock receipts created at the HO branch.
          </p>
        </div>
        <Button type="button" onClick={() => navigate('/card-stock/create')}>
          New Receipt Stock
        </Button>
      </div>
      <SurfacePanel>
        <Table
          columns={columns}
          data={data}
          loading={isLoading}
          isFetching={isFetching}
          enableSorting={false}
          enableFiltering={false}
          enablePagination
          manualPagination
          page={page}
          pageSize={limit}
          total={total}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          emptyMessage="No card stock receipts found."
        />
      </SurfacePanel>
    </div>
  );
};

export default CardStockListView;
