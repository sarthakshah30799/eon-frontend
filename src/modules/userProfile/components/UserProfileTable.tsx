import { useNavigate } from 'react-router-dom';
import {PencilSquareIcon} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table';
import type { UserProfileRecord } from '../types';
import {
  getBranchLabel,
  getCorporateClientLabel,
  getGroupLabel,
  getPurposeLabel,
} from '../utils';

interface UserProfileTableProps {
  profiles: UserProfileRecord[];
  onDelete: (id: string) => void | Promise<void>;
  isDeleting?: boolean;
}

interface UserProfileTableRow {
  id: string;
  corporateClient: string;
  code: string;
  name: string;
  cellNo: string;
  emailId: string;
  branch: string;
  idWillExpireOn: string;
  groups: string;
  purpose: string;
  mpUsername: string;
}

const formatDate = (value: string): string => {
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime())
    ? value
    : parsedDate.toLocaleDateString();
};

export const UserProfileTable = ({
  profiles,
}: UserProfileTableProps) => {
  const navigate = useNavigate();

  const rows: UserProfileTableRow[] = profiles.map(profile => ({
    id: profile.id,
    corporateClient: getCorporateClientLabel(profile.corporateClientId),
    code: profile.code,
    name: profile.name,
    cellNo: profile.cellNo,
    emailId: profile.emailId,
    branch: getBranchLabel(profile.branchId),
    idWillExpireOn: formatDate(profile.idWillExpireOn),
    groups: getGroupLabel(profile.groupId),
    purpose: getPurposeLabel(profile.purposeId),
    mpUsername: profile.mpUsername,
  }));

  const columns: TableColumnDef<UserProfileTableRow>[] = [
    { accessorKey: 'corporateClient', header: 'Corporate Client' },
    { accessorKey: 'code', header: 'Code' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'cellNo', header: 'Cell No' },
    { accessorKey: 'emailId', header: 'Email ID' },
    { accessorKey: 'branch', header: 'Branch' },
    { accessorKey: 'idWillExpireOn', header: 'ID will expire on' },
    { accessorKey: 'groups', header: 'Groups' },
    { accessorKey: 'purpose', header: 'Purpose' },
    { accessorKey: 'mpUsername', header: 'MP Username' },
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
