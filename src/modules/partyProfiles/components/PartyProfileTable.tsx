import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table';
import { usePermission } from '@/hooks';
import type { IPartyProfile } from '../types/partyProfileTypes';
import {
  DEFAULT_PARTY_PROFILE_TYPE,
  getPartyProfileTypeConfig,
  type PartyProfileType,
} from '../constants';

interface PartyProfileTableProps {
  clients: IPartyProfile[];
  loading?: boolean;
  profileType?: PartyProfileType;
  selectedType?: string;
}

interface PartyProfileTableRow {
  id: string;
  code: string;
  name: string;
  city: string;
  pinCode: string;
  phoneNo: string;
  active: string;
}

export const PartyProfileTable = ({
  clients,
  loading = false,
  profileType = DEFAULT_PARTY_PROFILE_TYPE,
  selectedType = 'party-profiles',
}: PartyProfileTableProps) => {
  const navigate = useNavigate();
  const { canModify, canView } = usePermission('/party-profiles');
  const profileTypeConfig = getPartyProfileTypeConfig(profileType);

  const rows: PartyProfileTableRow[] = clients.map(client => ({
    id: client.id,
    code: client.code,
    name: client.name,
    city: client.city,
    pinCode: client.pinCode,
    phoneNo: client.phoneNo || '',
    active: client.active ? 'Active' : 'Inactive',
  }));

  const columns: TableColumnDef<PartyProfileTableRow>[] = [
    { accessorKey: 'code', header: 'Client Code' },
    { accessorKey: 'name', header: 'Client Name' },
    { accessorKey: 'city', header: 'City' },
    { accessorKey: 'pinCode', header: 'Pin Code' },
    { accessorKey: 'phoneNo', header: 'Phone No.' },
    { accessorKey: 'active', header: 'Status' },
    {
      id: 'actions',
      header: 'Actions',
      meta: {
        headerClassName:
          'sticky right-0 z-20 border-l border-border-primary bg-surface-secondary',
        cellClassName:
          'sticky right-0 z-10 border-l border-border-primary bg-surface-primary',
      },
      cell: ({ row }) => {
        const clientId = row.original.id;

        if (!canModify && !canView) return null;

        return (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              aria-label={canModify ? 'Edit party profile' : 'View party profile'}
              variant="ghost"
              size="icon"
              className="rounded-sm bg-transparent text-black! hover:bg-surface-secondary hover:text-text-primary"
              onClick={event => {
                event.stopPropagation();
                navigate({
                  pathname: `/party-profiles/edit/${clientId}`,
                  search: `?type=${selectedType}`,
                });
              }}
            >
              {canModify ? (
                <PencilSquareIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
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
          ? row =>
              navigate({
                pathname: `/party-profiles/edit/${row.id}`,
                search: `?type=${selectedType}`,
              })
          : undefined
      }
      emptyMessage={profileTypeConfig.listEmptyMessage}
    />
  );
};

export default PartyProfileTable;
