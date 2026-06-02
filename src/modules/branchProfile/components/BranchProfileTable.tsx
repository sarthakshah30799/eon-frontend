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
  branchCode: string;
  branchNumber: string;
  city: string;
  state: string;
  contactName: string;
  contactNo: string;
  branchEmailId: string;
  locationType: string;
  status: string;
}

export const BranchProfileTable = ({
  branches,
}: BranchProfileTableProps) => {
  const navigate = useNavigate();

  const rows: BranchProfileTableRow[] = branches.map(branch => {
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
      branchCode: branch.branchCode || '',
      branchNumber: branch.branchNumber || '',
      city: branch.city || '',
      state: branch.state || '',
      contactName: branch.contactName || '-',
      contactNo: branch.contactNo || '-',
      branchEmailId: branch.branchEmailId || '-',
      locationType: branch.locationType || '-',
      status: statusParts.join(' / '),
    };
  });

  const columns: TableColumnDef<BranchProfileTableRow>[] = [
    { accessorKey: 'branchCode', header: 'Branch Code' },
    { accessorKey: 'branchNumber', header: 'Branch Number' },
    { accessorKey: 'city', header: 'City' },
    { accessorKey: 'state', header: 'State' },
    { accessorKey: 'contactName', header: 'Contact Name' },
    { accessorKey: 'contactNo', header: 'Contact No' },
    { accessorKey: 'branchEmailId', header: 'Email ID' },
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
              aria-label="Edit branch"
              className='border-0! bg-transparent! text-black!'
              onClick={event => {
                event.stopPropagation();
                navigate(`/master/system-setups/branch-profile/edit/${branchId}`);
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
        navigate(`/master/system-setups/branch-profile/edit/${row.id}`);
      }}
      emptyMessage="No branches found. Create your first branch."
    />
  );
};
