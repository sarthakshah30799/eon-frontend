import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { ToggleSwitch } from '@/components/ui/toggleSwitch';
import { Table, type TableColumnDef } from '@/components/ui/table';
import type { IUserRole } from '../types';

interface UserRoleTableProps {
  roles: IUserRole[];
  onToggleStatus: (id: string, isActive: boolean) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  isUpdatingStatus?: boolean;
  isDeleting?: boolean;
}

interface UserRoleTableRow {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export const UserRoleTable = ({
  roles,
  onToggleStatus,
  isUpdatingStatus = false,
}: UserRoleTableProps) => {
  const navigate = useNavigate();

  const rows: UserRoleTableRow[] = roles.map(role => ({
    id: role.id,
    code: role.code,
    name: role.name,
    isActive: role.isActive,
  }));

  const columns: TableColumnDef<UserRoleTableRow>[] = [
    { accessorKey: 'code', header: 'Role Code' },
    { accessorKey: 'name', header: 'Role Name' },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const roleId = row.original.id;
        const isActive = row.original.isActive;

        return (
          <div className="flex items-center gap-3">
            <ToggleSwitch
              checked={isActive}
              onCheckedChange={nextChecked => {
                onToggleStatus(roleId, nextChecked);
              }}
              disabled={isUpdatingStatus}
            />
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      meta: {
        headerClassName:
          'sticky right-0 z-20 border-l border-border-primary bg-surface-secondary',
      },
      cell: ({ row }) => {
        const roleId = row.original.id;

        return (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              aria-label="Edit role"
              size="sm"
              className='border-0! bg-transparent! text-black!'
              onClick={event => {
                event.stopPropagation();
                navigate(`/admin/user-role/edit/${roleId}`);
              }}
            >
              <PencilSquareIcon className="h-5 w-5" />
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
      enablePagination={false}
      enableRowSelection={false}
      enableColumnVisibility={false}
      onRowClick={row => {
        navigate(`/admin/user-role/edit/${row.id}`);
      }}
      emptyMessage="No roles found. Create your first role."
    />
  );
};
