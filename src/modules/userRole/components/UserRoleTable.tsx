import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table';
import type { UserRoleRecord } from '../types';

interface UserRoleTableProps {
  roles: UserRoleRecord[];
  onDelete: (id: string) => void | Promise<void>;
  isDeleting?: boolean;
}

interface UserRoleTableRow {
  id: string;
  roleCode: string;
  roleName: string;
  status: string;
}

export const UserRoleTable = ({
  roles,
  onDelete,
  isDeleting = false,
}: UserRoleTableProps) => {
  const navigate = useNavigate();

  const rows: UserRoleTableRow[] = roles.map(role => ({
    id: role.id,
    roleCode: role.roleCode,
    roleName: role.roleName,
    status: role.isActive ? 'Active' : 'Inactive',
  }));

  const columns: TableColumnDef<UserRoleTableRow>[] = [
    { accessorKey: 'roleCode', header: 'Role Code' },
    { accessorKey: 'roleName', header: 'Role Name' },
    { accessorKey: 'status', header: 'Status' },
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
        const roleId = row.original.id;

        return (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              aria-label="Edit role"
              className="border-0! bg-transparent! text-black!"
              onClick={event => {
                event.stopPropagation();
                navigate(`/master/system-setups/user-role/edit/${roleId}`);
              }}
            >
              <PencilSquareIcon className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              aria-label="Delete role"
              disabled={isDeleting}
              className="border-0! bg-transparent! text-red-500! hover:bg-red-50 focus:ring-red-500"
              onClick={async event => {
                event.stopPropagation();
                const shouldDelete = window.confirm(
                  'Are you sure you want to delete this role?'
                );

                if (shouldDelete) {
                  await onDelete(roleId);
                }
              }}
            >
              <TrashIcon className="h-5 w-5" />
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
        navigate(`/master/system-setups/user-role/edit/${row.id}`);
      }}
      emptyMessage="No roles found. Create your first role."
    />
  );
};
