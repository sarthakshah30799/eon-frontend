import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table';
import { PURPOSE_GROUP_TEXTS } from '../constants/purposeGroupConstants';
import { formatPurposeGroupProfileLabel } from '../utils/purposeGroupUtils';
import type { IPurposeGroup } from '../types/purposeGroupTypes';

interface PurposeGroupTableProps {
  purposeGroups: IPurposeGroup[];
  onDelete: (id: string) => void | Promise<void>;
  isDeleting?: boolean;
  loading?: boolean;
  onSearch?: (value: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
}

interface PurposeGroupTableRow {
  id: string;
  name: string;
  title: string;
  profileType: string;
  sortOrder: number;
  purposeCount: number;
  purposes: string;
}

export const PurposeGroupTable = ({
  purposeGroups,
  onDelete,
  isDeleting = false,
  loading = false,
  onSearch,
  searchValue = '',
  searchPlaceholder = 'Search',
}: PurposeGroupTableProps) => {
  const navigate = useNavigate();

  const rows: PurposeGroupTableRow[] = useMemo(
    () =>
      purposeGroups.map(purposeGroup => ({
        id: purposeGroup.id,
        name: purposeGroup.name,
        title: purposeGroup.title,
        profileType: formatPurposeGroupProfileLabel(purposeGroup.profileType),
        sortOrder: purposeGroup.sortOrder,
        purposeCount: purposeGroup.purposes?.length ?? 0,
        purposes: (purposeGroup.purposes ?? [])
          .map(purpose => purpose.code)
          .join(', '),
      })),
    [purposeGroups]
  );

  const columns: TableColumnDef<PurposeGroupTableRow>[] = [
    { accessorKey: 'name', header: 'Group name' },
    { accessorKey: 'sortOrder', header: PURPOSE_GROUP_TEXTS.SORT_ORDER },
    { accessorKey: 'title', header: 'Report title' },
    { accessorKey: 'profileType', header: 'Profile type' },
    { accessorKey: 'purposes', header: 'Purposes' },
    { accessorKey: 'purposeCount', header: 'Count' },
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
            aria-label="Edit purpose group"
            variant="ghost"
            size="icon"
            className="rounded-sm bg-transparent text-black! hover:bg-surface-secondary hover:text-text-primary"
            onClick={event => {
              event.stopPropagation();
              navigate(`/admin/purpose-group/edit/${row.original.id}`);
            }}
          >
            <PencilSquareIcon className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            aria-label="Delete purpose group"
            variant="ghost"
            size="icon"
            className="rounded-sm bg-transparent text-error-600 hover:bg-error-50 hover:text-error-700"
            disabled={isDeleting}
            onClick={async event => {
              event.stopPropagation();
              if (
                window.confirm(
                  'Are you sure you want to delete this purpose group?'
                )
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
      enablePagination={false}
      enableColumnVisibility={false}
      enableRowSelection={false}
      loading={loading}
      onSearch={onSearch}
      searchValue={searchValue}
      searchPlaceholder={searchPlaceholder}
      onRowClick={row => {
        navigate(`/admin/purpose-group/edit/${row.id}`);
      }}
      emptyMessage="No purpose groups found. Create your first purpose group."
    />
  );
};
