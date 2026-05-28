import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table';
import type { UserProfileRecord } from '../types';

interface UserProfileTableProps {
  profiles: UserProfileRecord[];
  onDelete: (id: string) => void | Promise<void>;
  isDeleting?: boolean;
}

interface UserProfileTableRow {
  id: string;
  userCode: string;
  name: string;
  email: string;
  phoneNumber: string;
  status: string;
  isHo: string;
}

export const UserProfileTable = ({
  profiles,
  onDelete,
  isDeleting = false,
}: UserProfileTableProps) => {
  const navigate = useNavigate();

  const rows: UserProfileTableRow[] = profiles.map(profile => ({
    id: profile.id,
    userCode: profile.userCode || '',
    name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
    email: profile.email || '',
    phoneNumber: profile.phoneNumber || '',
    status: profile.status ? profile.status.toUpperCase() : 'PENDING',
    isHo: profile.isHo ? 'Yes' : 'No',
  }));

  const columns: TableColumnDef<UserProfileTableRow>[] = [
    { accessorKey: 'userCode', header: 'User Code' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'phoneNumber', header: 'Phone' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'isHo', header: 'HO User' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const profileId = row.original.id;

        return (
          <div className="flex flex-wrap gap-2" onClick={event => event.stopPropagation()}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                navigate(`/master/system-setups/user-profile/edit/${profileId}`);
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
                  'Are you sure you want to delete this user?'
                );

                if (shouldDelete) {
                  await onDelete(profileId);
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
        navigate(`/master/system-setups/user-profile/edit/${row.id}`);
      }}
      emptyMessage="No users found. Create your first user."
    />
  );
};
