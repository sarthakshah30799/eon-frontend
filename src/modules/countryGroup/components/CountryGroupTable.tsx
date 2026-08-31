import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table';
import type { PaginationControlsProps } from '@/components/ui';
import { formatCountryGroupSellLimit, formatNullableInteger } from '../utils';
import type { ICountryGroup } from '../types';

interface CountryGroupTableProps extends PaginationControlsProps {
  groups: ICountryGroup[];
  onDelete?: (id: string) => void | Promise<void>;
  canModify?: boolean;
  canDelete?: boolean;
  isDeleting?: boolean;
  loading?: boolean;
  isFetching?: boolean;
  onSearch?: (value: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
}

interface CountryGroupTableRow {
  id: string;
  code: string;
  name: string;
  sellLimit: string;
  minTravelDays: string;
  maxTravelDays: string;
}

export const CountryGroupTable = ({
  groups,
  onDelete,
  canModify = false,
  canDelete = false,
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
}: CountryGroupTableProps) => {
  const navigate = useNavigate();

  const rows: CountryGroupTableRow[] = groups.map(group => ({
    id: group.id,
    code: group.code,
    name: group.name,
    sellLimit: formatCountryGroupSellLimit(group),
    minTravelDays: formatNullableInteger(group.minTravelDays),
    maxTravelDays: formatNullableInteger(group.maxTravelDays),
  }));

  const columns: TableColumnDef<CountryGroupTableRow>[] = [
    { accessorKey: 'code', header: 'Code' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'sellLimit', header: 'Sell Limit' },
    { accessorKey: 'minTravelDays', header: 'Minimum Travel Days' },
    { accessorKey: 'maxTravelDays', header: 'Maximum Travel Days' },
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
          {canModify ? (
            <Button
              type="button"
              aria-label="Edit country group"
              variant="ghost"
              size="icon"
              className="rounded-sm bg-transparent text-black! hover:bg-surface-secondary hover:text-text-primary"
              onClick={event => {
                event.stopPropagation();
                navigate(`/admin/country-group/edit/${row.original.id}`);
              }}
            >
              <PencilSquareIcon className="h-5 w-5" />
            </Button>
          ) : null}
          {canDelete && onDelete ? (
            <Button
              type="button"
              aria-label="Delete country group"
              variant="ghost"
              size="icon"
              className="rounded-sm bg-transparent text-error-600 hover:bg-error-50 hover:text-error-700"
              disabled={isDeleting}
              onClick={async event => {
                event.stopPropagation();
                if (
                  window.confirm(
                    'Are you sure you want to delete this country group?'
                  )
                ) {
                  await onDelete(row.original.id);
                }
              }}
            >
              <TrashIcon className="h-5 w-5" />
            </Button>
          ) : null}
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
        if (canModify) {
          navigate(`/admin/country-group/edit/${row.id}`);
        }
      }}
      emptyMessage="No country groups found. Create your first country group."
    />
  );
};
