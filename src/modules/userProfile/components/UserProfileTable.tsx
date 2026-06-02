import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table';
import type { IUserProfile } from '../types';

interface UserProfileTableProps {
  profiles: IUserProfile[];
  onDelete: (id: string) => void | Promise<void>;
  isDeleting?: boolean;
}

interface UserProfileTableRow {
  id: string;
  userCode: string;
  userName: string;
  emailId: string;
  contactNo: string;
  userGroupCode: string;
  branchCode: string;
  designation: string;
  status: string;
}

export const UserProfileTable = ({
  profiles,
}: UserProfileTableProps) => {
  const navigate = useNavigate();

  const rows: UserProfileTableRow[] = profiles.map(profile => {
    const statusParts: string[] = [];
    if (profile.isActive) {
      statusParts.push('Active');
    } else {
      statusParts.push('Inactive');
    }
    if (profile.isLocked) {
      statusParts.push('Locked');
    }
    if (profile.isDormant) {
      statusParts.push('Dormant');
    }

    return {
      id: profile.id,
      userCode: profile.userCode,
      userName: profile.userName,
      emailId: profile.emailId,
      contactNo: profile.contactNo || '-',
      userGroupCode: profile.userGroupCode || '-',
      branchCode: profile.branchCode || '-',
      designation: profile.designation || '-',
      status: statusParts.join(' / '),
    };
  });

  const columns: TableColumnDef<UserProfileTableRow>[] = [
    { accessorKey: 'userCode', header: 'User Code' },
    { accessorKey: 'userName', header: 'User Name' },
    { accessorKey: 'emailId', header: 'Email ID' },
    { accessorKey: 'contactNo', header: 'Contact No' },
    { accessorKey: 'userGroupCode', header: 'Group Code' },
    { accessorKey: 'branchCode', header: 'Branch Code' },
    { accessorKey: 'designation', header: 'Designation' },
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
        const profileId = row.original.id;

        return (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              aria-label="Edit user"
              className='border-0! bg-transparent! text-black!'
              onClick={event => {
                event.stopPropagation();
                navigate(
                  `/master/system-setups/user-profile/edit/${profileId}`
                );
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
        navigate(`/master/system-setups/user-profile/edit/${row.id}`);
      }}
      emptyMessage="No users found. Create your first user."
    />
  );
};
