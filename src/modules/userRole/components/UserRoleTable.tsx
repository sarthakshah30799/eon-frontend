import { useNavigate } from 'react-router-dom';
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
      cell: ({ row }) => {
        const roleId = row.original.id;

        return (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={event => {
                event.stopPropagation();
                navigate(`/master/system-setups/user-role/edit/${roleId}`);
              }}
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isDeleting}
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
              Delete
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

