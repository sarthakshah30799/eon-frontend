import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table';
import type { IDocumentProfile } from '../types';

interface DocumentProfileTableProps {
  documentProfiles: IDocumentProfile[];
  onDelete: (id: string) => void | Promise<void>;
  isDeleting?: boolean;
}

interface DocumentProfileTableRow {
  id: string;
  profileCode: string;
  profileName: string;
  ruleCount: number;
  active: boolean;
}

export const DocumentProfileTable = ({
  documentProfiles,
  onDelete,
  isDeleting = false,
}: DocumentProfileTableProps) => {
  const navigate = useNavigate();

  const rows: DocumentProfileTableRow[] = useMemo(
    () =>
      documentProfiles.map(profile => ({
        id: profile.id,
        profileCode: profile.profileCode,
        profileName: profile.profileName,
        ruleCount: profile.rules?.length ?? 0,
        active: profile.active,
      })),
    [documentProfiles]
  );

  const columns: TableColumnDef<DocumentProfileTableRow>[] = [
    { accessorKey: 'profileCode', header: 'Profile Code' },
    { accessorKey: 'profileName', header: 'Profile Name' },
    { accessorKey: 'ruleCount', header: 'Rules' },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row }) => (row.original.active ? 'Active' : 'Inactive'),
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
            aria-label="Edit document profile"
            variant="ghost"
            size="icon"
            className="rounded-sm bg-transparent text-black! hover:bg-surface-secondary hover:text-text-primary"
            onClick={event => {
              event.stopPropagation();
              navigate(`/admin/document-profile/edit/${row.original.id}`);
            }}
          >
            <PencilSquareIcon className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            aria-label="Delete document profile"
            variant="ghost"
            size="icon"
            className="rounded-sm bg-transparent text-error-600 hover:bg-error-50 hover:text-error-700"
            disabled={isDeleting}
            onClick={event => {
              event.stopPropagation();
              void onDelete(row.original.id);
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
      onRowClick={row => {
        navigate(`/admin/document-profile/edit/${row.id}`);
      }}
      emptyMessage="No document profiles found. Create your first profile."
    />
  );
};

