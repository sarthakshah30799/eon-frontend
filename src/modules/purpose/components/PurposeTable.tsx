import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table';
import type { PaginationControlsProps } from '@/components/ui';
import {
  formatPurposeRateLabel,
  formatPurposeScopeLabel,
  formatPurposeTransactionScopeLabel,
} from '../utils/purposeUtils';
import type { IPurpose } from '../types/purposeTypes';

interface PurposeTableProps extends PaginationControlsProps {
  purposes: IPurpose[];
  onDelete: (id: string) => void | Promise<void>;
  isDeleting?: boolean;
  loading?: boolean;
  isFetching?: boolean;
  onSearch?: (value: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
}

interface PurposeTableRow {
  id: string;
  code: string;
  description: string;
  threshold: string;
  rate: string;
  rateType: string;
  partyScope: string;
  transactionScope: string;
  slabCount: number;
}

export const PurposeTable = ({
  purposes,
  onDelete,
  isDeleting = false,
  loading = false,
  isFetching = false,
  onSearch,
  searchValue = '',
  searchPlaceholder = 'Search',
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: PurposeTableProps) => {
  const navigate = useNavigate();

  const rows: PurposeTableRow[] = useMemo(
    () =>
      purposes.map(purpose => ({
        id: purpose.id,
        code: purpose.code,
        description: purpose.description,
        threshold: Number(purpose.threshold || 0).toFixed(2),
        rate: Number(purpose.rate || 0).toFixed(2),
        rateType: purpose.rateType,
        partyScope: formatPurposeScopeLabel(
          purpose.corporate,
          purpose.individual
        ),
        transactionScope: formatPurposeTransactionScopeLabel(
          purpose.sell,
          purpose.purchase
        ),
        slabCount: purpose.slabs?.length ?? 0,
      })),
    [purposes]
  );

  const columns: TableColumnDef<PurposeTableRow>[] = [
    { accessorKey: 'code', header: 'Code' },
    { accessorKey: 'description', header: 'Description' },
    { accessorKey: 'partyScope', header: 'Profile Type' },
    { accessorKey: 'transactionScope', header: 'Transaction Type' },
    { accessorKey: 'threshold', header: 'Threshold' },
    {
      accessorKey: 'rate',
      header: 'Rate',
      cell: ({ row }) =>
        formatPurposeRateLabel(
          Number(row.original.rate),
          row.original.rateType
        ),
    },
    { accessorKey: 'slabCount', header: 'Slabs' },
    {
      id: 'actions',
      header: 'Actions',
      meta: {
        headerClassName:
          'sticky right-0 z-20 border-l border-border-primary bg-surface-secondary',
        cellClassName:
          'sticky right-0 z-10 border-l border-border-primary bg-surface-primary',
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            aria-label="Edit purpose"
            variant="ghost"
            size="icon"
            className="rounded-sm bg-transparent text-black! hover:bg-surface-secondary hover:text-text-primary"
            onClick={event => {
              event.stopPropagation();
              navigate(`/admin/purpose/edit/${row.original.id}`);
            }}
          >
            <PencilSquareIcon className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            aria-label="Delete purpose"
            variant="ghost"
            size="icon"
            className="rounded-sm bg-transparent text-error-600 hover:bg-error-50 hover:text-error-700"
            disabled={isDeleting}
            onClick={async event => {
              event.stopPropagation();
              if (
                window.confirm('Are you sure you want to delete this purpose?')
              ) {
                await onDelete(row.original.id);
              }
            }}
          >
            <TrashIcon className="h-5 w-5" />
          </Button>
        </div>
      ),
      enableSorting: false,
    },
  ];

  return (
    <Table
      columns={columns}
      data={rows}
      enableFiltering={false}
      enablePagination
      manualPagination
      enableColumnVisibility={false}
      enableRowSelection={false}
      loading={loading}
      isFetching={isFetching}
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={totalPages}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onSearch={onSearch}
      searchValue={searchValue}
      searchPlaceholder={searchPlaceholder}
      onRowClick={row => {
        navigate(`/admin/purpose/edit/${row.id}`);
      }}
      emptyMessage="No purposes found. Create your first purpose."
    />
  );
};
