import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table';
import { usePermission } from '@/hooks';
import type { IFfmcClient } from '../types/ffmcClientTypes';

interface FfmcClientTableProps {
  clients: IFfmcClient[];
  loading?: boolean;
}

interface FfmcClientTableRow {
  id: string;
  code: string;
  name: string;
  ffmcRegNo: string;
  city: string;
  phoneNo: string;
  active: string;
}

export const FfmcClientTable = ({ clients, loading = false }: FfmcClientTableProps) => {
  const navigate = useNavigate();
  const { canModify, canView } = usePermission('/admin/ffmc-client-profile');

  const rows: FfmcClientTableRow[] = clients.map(client => ({
    id: client.id,
    code: client.code,
    name: client.name,
    ffmcRegNo: client.ffmcRegNo || '—',
    city: client.city,
    phoneNo: client.phoneNo || '',
    active: client.active ? 'Active' : 'Inactive',
  }));

  const columns: TableColumnDef<FfmcClientTableRow>[] = [
    { accessorKey: 'code', header: 'Client Code' },
    { accessorKey: 'name', header: 'Client Name' },
    { accessorKey: 'ffmcRegNo', header: 'FFMC Reg. No.' },
    { accessorKey: 'city', header: 'City' },
    { accessorKey: 'phoneNo', header: 'Phone No.' },
    { accessorKey: 'active', header: 'Status' },
    {
      id: 'actions',
      header: 'Actions',
      meta: {
        headerClassName: 'sticky right-0 z-20 border-l border-border-primary bg-surface-secondary',
        cellClassName: 'sticky right-0 z-10 border-l border-border-primary bg-surface-primary',
      },
      cell: ({ row }) => {
        const clientId = row.original.id;
        if (!canModify && !canView) return null;
        return (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              aria-label={canModify ? 'Edit FFMC client' : 'View FFMC client'}
              variant="ghost"
              size="icon"
              className="rounded-sm bg-transparent text-black! hover:bg-surface-secondary hover:text-text-primary"
              onClick={event => {
                event.stopPropagation();
                navigate(`/admin/ffmc-client-profile/edit/${clientId}`);
              }}
            >
              {canModify ? <PencilSquareIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </Button>
          </div>
        );
      },
      enableSorting: false,
    },
  ];

  return (
    <Table
      columns={columns}
      data={rows}
      enableFiltering={false}
      enableRowSelection={false}
      enableColumnVisibility={false}
      loading={loading}
      onRowClick={
        canModify || canView
          ? row => navigate(`/admin/ffmc-client-profile/edit/${row.id}`)
          : undefined
      }
      emptyMessage="No FFMC client profiles found. Create your first profile."
    />
  );
};

export default FfmcClientTable;
