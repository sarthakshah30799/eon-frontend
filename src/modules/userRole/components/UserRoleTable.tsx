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
  code: string;
  name: string;
  description: string;
}

export const UserRoleTable = ({
  roles,
  onDelete,
  isDeleting = false,
}: UserRoleTableProps) => {
  const navigate = useNavigate();

  const rows: UserRoleTableRow[] = roles.map(role => ({
    id: role.id,
    code: role.code,
    name: role.name,
    description: role.description || '',
  }));

  const columns: TableColumnDef<UserRoleTableRow>[] = [
    { accessorKey: 'code', header: 'Role Code' },
    { accessorKey: 'name', header: 'Role Name' },
    { accessorKey: 'description', header: 'Description' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const roleId = row.original.id;

        return (
          <div className="flex flex-wrap gap-2" onClick={event => event.stopPropagation()}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                navigate(`/master/system-setups/roles-profile/edit/${roleId}`);
              }}
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={async () => {
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
        navigate(`/master/system-setups/roles-profile/edit/${row.id}`);
      }}
      emptyMessage="No roles found. Create your first role."
    />
  );
};
