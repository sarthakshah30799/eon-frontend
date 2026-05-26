import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table';
import type { UserProfileRecord } from '../types';
import {
  getBranchLabel,
  getControlSetupSummary,
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
  controlSetup: string;
}

const formatDate = (value: string): string => {
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime())
    ? value
    : parsedDate.toLocaleDateString();
};

export const UserProfileTable = ({
  profiles,
  onDelete,
  isDeleting = false,
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
    controlSetup: getControlSetupSummary(profile.controlSetup),
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
    { accessorKey: 'controlSetup', header: 'Control Setup' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const profileId = row.original.id;

        return (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={event => {
                event.stopPropagation();
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
              onClick={async event => {
                event.stopPropagation();
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
