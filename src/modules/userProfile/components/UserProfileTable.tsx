import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import {
  Table,
  type TableColumnDef,
  TABLE_ACTIONS_CELL_CLASSNAME,
  TABLE_ACTION_BUTTON_CLASSNAME,
  TABLE_ACTION_ICON_CLASSNAME,
} from '@/components/ui/table';
import type { PaginationControlsProps } from '@/components/ui';
import type { IUserProfile } from '../types';

interface UserProfileTableProps extends PaginationControlsProps {
  profiles: IUserProfile[];
  onDelete: (id: string) => void | Promise<void>;
  isDeleting?: boolean;
  loading?: boolean;
  isFetching?: boolean;
  onSearch?: (value: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
}

interface UserProfileTableRow {
  id: string;
  code: string;
  name: string;
  email: string;
  contactNo: string;
  designation: string;
  status: string;
}

export const UserProfileTable = ({
  profiles,
  loading,
  isFetching = false,
  onSearch,
  searchValue,
  searchPlaceholder,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
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
      code: profile.code,
      name: profile.name,
      email: profile.email,
      contactNo: profile.contactNo || '-',
      designation: profile.designation || '-',
      status: statusParts.join(' / '),
    };
  });

  const columns: TableColumnDef<UserProfileTableRow>[] = [
    { accessorKey: 'code', header: 'User Code' },
    { accessorKey: 'name', header: 'User Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'contactNo', header: 'Contact No' },
    { accessorKey: 'designation', header: 'Designation' },
    { accessorKey: 'status', header: 'Status' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const profileId = row.original.id;

        return (
          <div className={TABLE_ACTIONS_CELL_CLASSNAME}>
            <Button
              type="button"
              aria-label="Edit user"
              variant="ghost"
              size="icon"
              className={TABLE_ACTION_BUTTON_CLASSNAME}
              onClick={event => {
                event.stopPropagation();
                navigate(`/user-profile/edit/${profileId}`);
              }}
            >
              <PencilSquareIcon className={TABLE_ACTION_ICON_CLASSNAME} />
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
      onSearch={onSearch}
      searchValue={searchValue}
      searchPlaceholder={searchPlaceholder}
      onRowClick={row => {
        navigate(`/user-profile/edit/${row.id}`);
      }}
      emptyMessage="No users found. Create your first user."
    />
  );
};
