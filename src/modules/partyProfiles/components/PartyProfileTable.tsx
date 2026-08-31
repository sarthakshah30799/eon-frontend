import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef, type TableToolbarFilter } from '@/components/ui/table';
import type { PaginationControlsProps } from '@/components/ui';
import { usePermission } from '@/hooks';
import { useAuth } from '@/lib/AuthContext';
import type { IPartyProfile } from '../types/partyProfileTypes';
import { PartyProfileDocumentsActionButton } from './PartyProfileDocumentsActionButton';

interface PartyProfileTableProps extends PaginationControlsProps {
  clients: IPartyProfile[];
  loading?: boolean;
  isFetching?: boolean;
  selectedType?: string;
  onSearch?: (value: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
  toolbarFilters?: TableToolbarFilter[];
}

interface PartyProfileTableRow {
  id: string;
  createdBy: {
    id: string;
    name: string;
  };
  createdByName: string;
  type: string;
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
  isFetching = false,
  selectedType = '',
  onSearch,
  searchValue,
  searchPlaceholder,
  toolbarFilters,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: PartyProfileTableProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canModify, canView } = usePermission(
    selectedType ? `/party-profiles/${selectedType}` : '/party-profiles'
  );

  const rows: PartyProfileTableRow[] = clients.map(client => ({
    id: client.id,
    createdBy: client.createdBy,
    createdByName: client.createdBy.name,
    type: client.type,
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
    {
      accessorKey: 'createdByName',
      header: 'Created By',
      cell: ({ row }) => row.original.createdByName,
    },
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
        const canEditThisProfile =
          canModify &&
          (user?.isAdmin === true || row.original.createdBy.id === user?.id);

        if (!canModify && !canView) return null;

        return (
          <div className="flex items-center gap-2">
            <PartyProfileDocumentsActionButton
              partyProfileId={clientId}
              partyProfileType={row.original.type}
              label="Upload Documents"
              compact
            />
            <Button
              type="button"
              aria-label={
                canEditThisProfile ? 'Edit party profile' : 'View party profile'
              }
              variant="ghost"
              size="icon"
              className="rounded-sm bg-transparent text-black! hover:bg-surface-secondary hover:text-text-primary"
              onClick={event => {
                event.stopPropagation();
                navigate({
                  pathname: `/party-profiles/${selectedType}/edit/${clientId}`,
                });
              }}
            >
              {canEditThisProfile ? (
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

  const useLegacySearch = Boolean(onSearch) && !toolbarFilters?.length;

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
      onSearch={useLegacySearch ? onSearch : undefined}
      searchValue={useLegacySearch ? searchValue : undefined}
      searchPlaceholder={searchPlaceholder}
      toolbarFilters={toolbarFilters}
      onRowClick={
        canModify || canView
          ? row =>
              navigate({
                pathname: `/party-profiles/${selectedType}/edit/${row.id}`,
              })
          : undefined
      }
      emptyMessage={
        selectedType
          ? `No ${selectedType.replace(/-/g, ' ').toUpperCase()} found. Create your first profile.`
          : 'No party profiles found.'
      }
    />
  );
};

export default PartyProfileTable;
