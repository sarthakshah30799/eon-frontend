import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import {
  Table,
  type TableColumnDef,
  TABLE_ACTIONS_CELL_CLASSNAME,
  TABLE_ACTION_BUTTON_CLASSNAME,
  TABLE_ACTION_DELETE_BUTTON_CLASSNAME,
  TABLE_ACTION_ICON_CLASSNAME,
} from '@/components/ui/table';
import type { PaginationControlsProps } from '@/components/ui';
import { formatDateTime } from '@/utils';
import type { ITdsProfile } from '../types';

interface TdsProfileTableProps extends PaginationControlsProps {
  tdsProfiles: ITdsProfile[];
  onDelete: (id: string) => void | Promise<void>;
  isDeleting?: boolean;
  loading?: boolean;
  isFetching?: boolean;
  onSearch?: (value: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
}

interface TdsProfileTableRow {
  id: string;
  code: string;
  name: string;
  description: string;
  from: string;
  to: string;
  value: string;
  sortOrder: number;
  active: boolean;
}

export const TdsProfileTable = ({
  tdsProfiles,
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
}: TdsProfileTableProps) => {
  const navigate = useNavigate();

  const rows: TdsProfileTableRow[] = useMemo(
    () =>
      tdsProfiles.map(profile => ({
        id: profile.id,
        code: profile.code,
        name: profile.name,
        description: profile.description || '-',
        from: profile.from || '',
        to: profile.to || '',
        value: profile.value.toString(),
        sortOrder: profile.sortOrder,
        active: profile.active,
      })),
    [tdsProfiles]
  );

  const columns: TableColumnDef<TdsProfileTableRow>[] = [
    { accessorKey: 'code', header: 'Code' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'description', header: 'Description' },
    {
      accessorKey: 'from',
      header: 'From',
      cell: ({ row }) => formatDateTime(row.original.from),
    },
    {
      accessorKey: 'to',
      header: 'To',
      cell: ({ row }) => formatDateTime(row.original.to),
    },
    { accessorKey: 'value', header: 'Value' },
    { accessorKey: 'sortOrder', header: 'Sort Order' },
    {
      accessorKey: 'active',
      header: 'Active',
      cell: ({ row }) => (row.original.active ? 'Yes' : 'No'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className={TABLE_ACTIONS_CELL_CLASSNAME}>
          <Button
            type="button"
            aria-label="Edit TDS profile"
            variant="ghost"
            size="icon"
            className={TABLE_ACTION_BUTTON_CLASSNAME}
            onClick={event => {
              event.stopPropagation();
              navigate(`/admin/tds-profile/edit/${row.original.id}`);
            }}
          >
            <PencilSquareIcon className={TABLE_ACTION_ICON_CLASSNAME} />
          </Button>
          <Button
            type="button"
            aria-label="Delete TDS profile"
            variant="ghost"
            size="icon"
            className={TABLE_ACTION_DELETE_BUTTON_CLASSNAME}
            disabled={isDeleting}
            onClick={async event => {
              event.stopPropagation();
              if (
                window.confirm(
                  'Are you sure you want to delete this TDS profile?'
                )
              ) {
                await onDelete(row.original.id);
              }
            }}
          >
            <TrashIcon className={TABLE_ACTION_ICON_CLASSNAME} />
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
      enableRowSelection={false}
      enableColumnVisibility={false}
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
        navigate(`/admin/tds-profile/edit/${row.id}`);
      }}
      emptyMessage="No TDS profiles found. Create your first profile."
    />
  );
};
