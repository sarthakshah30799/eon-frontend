import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table';
import type { IBranchProfile } from '../types';

interface BranchProfileTableProps {
  branches: IBranchProfile[];
  onDelete: (id: string) => void | Promise<void>;
  isDeleting?: boolean;
}

interface BranchProfileTableRow {
  id: string;
  code: string;
  name: string;
  branchNumber: string;
  country: string;
  state: string;
  city: string;
  contactName: string;
  contactNo: string;
  branchEmail: string;
  locationType: string;
  status: string;
}

export const BranchProfileTable = ({
  branches,
}: BranchProfileTableProps) => {
  const navigate = useNavigate();

  const rows: BranchProfileTableRow[] = useMemo(
    () =>
      branches.map(branch => {
        const statusParts: string[] = [];

        if (branch.isActive) {
          statusParts.push('Active');
        } else {
          statusParts.push('Inactive');
        }

        if (branch.isHeadOffice) {
          statusParts.push('Head Office');
        }

        return {
          id: branch.id,
          code: branch.code || '',
          name: branch.name || '-',
          branchNumber: branch.branchNumber || '',
          country: branch.country?.name || '-',
          state: branch.state?.name || '-',
          city: branch.city || '',
          contactName: branch.contactName || '-',
          contactNo: branch.contactNo || '-',
          branchEmail: branch.branchEmail || '-',
          locationType:
            typeof branch.locationType === 'string'
              ? branch.locationType
              : branch.locationType?.label ?? '-',
          status: statusParts.join(' / '),
        };
      }),
    [branches]
  );

  const columns: TableColumnDef<BranchProfileTableRow>[] = [
    { accessorKey: 'code', header: 'Branch Code' },
    { accessorKey: 'name', header: 'Branch Name' },
    { accessorKey: 'branchNumber', header: 'Branch Number' },
    { accessorKey: 'country', header: 'Country' },
    { accessorKey: 'state', header: 'State' },
    { accessorKey: 'city', header: 'City' },
    { accessorKey: 'contactName', header: 'Contact Name' },
    { accessorKey: 'contactNo', header: 'Contact No' },
    { accessorKey: 'branchEmail', header: 'Email' },
    { accessorKey: 'locationType', header: 'Location Type' },
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
        const branchId = row.original.id;

        return (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              aria-label="Edit company branch"
              className='border-0! bg-transparent! text-black!'
              onClick={event => {
                event.stopPropagation();
                navigate(`/admin/branch-profile/edit/${branchId}`);
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
        navigate(`/admin/branch-profile/edit/${row.id}`);
      }}
      emptyMessage="No company branches found. Create your first company branch."
    />
  );
};
