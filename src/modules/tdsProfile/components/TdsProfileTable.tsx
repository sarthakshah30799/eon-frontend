import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table';
import { formatDateTime } from '@/utils';
import type { ITdsProfile } from '../types';

interface TdsProfileTableProps {
  tdsProfiles: ITdsProfile[];
  onDelete: (id: string) => void | Promise<void>;
  isDeleting?: boolean;
  loading?: boolean;
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
  onSearch,
  searchValue = '',
  searchPlaceholder = 'Search',
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
            aria-label="Edit TDS profile"
            variant="ghost"
            size="icon"
            className="rounded-sm bg-transparent text-black! hover:bg-surface-secondary hover:text-text-primary"
            onClick={event => {
              event.stopPropagation();
              navigate(`/admin/tds-profile/edit/${row.original.id}`);
            }}
          >
            <PencilSquareIcon className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            aria-label="Delete TDS profile"
            variant="ghost"
            size="icon"
            className="rounded-sm bg-transparent text-error-600 hover:bg-error-50 hover:text-error-700"
            disabled={isDeleting}
            onClick={async event => {
              event.stopPropagation();
              if (window.confirm('Are you sure you want to delete this TDS profile?')) {
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
      enablePagination={false}
      enableRowSelection={false}
      enableColumnVisibility={false}
      loading={loading}
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
