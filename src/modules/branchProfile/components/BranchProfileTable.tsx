import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table';
import type { BranchProfileRecord } from '../types';
import {
  getAcUserInchargeLabel,
  getIbmBranchLabel,
  getLocationTypeLabel,
  getOperationalGroupLabel,
  getOperationalUserLabel,
  getStateLabel,
  getWuAcBranchPostingLabel,
} from '../utils';

interface BranchProfileTableProps {
  branches: BranchProfileRecord[];
  onDelete: (id: string) => void | Promise<void>;
  isDeleting?: boolean;
}

interface BranchProfileTableRow {
  id: string;
  branchName: string;
  branchCode: string;
  branchNo: string;
  city: string;
  state: string;
  operationalGroup: string;
  locationType: string;
  operationalUser: string;
  acUserIncharge: string;
  wuAcBranchPosting: string;
  ibmBranch: string;
  branchAttachedTo: string;
  contactPerson: string;
  emailId: string;
  phoneNo1: string;
}

const formatPhone = (countryCode: string, value: string): string => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return '-';
  }

  return `${countryCode} ${trimmedValue}`;
};

export const BranchProfileTable = ({
  branches,
  onDelete,
  isDeleting = false,
}: BranchProfileTableProps) => {
  const navigate = useNavigate();

  const branchNameMap = useMemo(() => {
    const map = new Map<string, string>();

    branches.forEach(branch => {
      map.set(branch.id, `${branch.branchName} (${branch.branchCode})`);
    });

    return map;
  }, [branches]);

  const rows: BranchProfileTableRow[] = branches.map(branch => ({
    id: branch.id,
    branchName: branch.branchName,
    branchCode: branch.branchCode,
    branchNo: branch.branchNo,
    city: branch.city,
    state: getStateLabel(branch.stateId),
    operationalGroup: getOperationalGroupLabel(branch.operationalGroupId),
    locationType: getLocationTypeLabel(branch.locationTypeId),
    operationalUser: getOperationalUserLabel(branch.operationalUserId),
    acUserIncharge: getAcUserInchargeLabel(branch.acUserInchargeId),
    wuAcBranchPosting: getWuAcBranchPostingLabel(branch.wuAcBranchPostingId),
    ibmBranch: getIbmBranchLabel(branch.ibmBranchId),
    branchAttachedTo: branchNameMap.get(branch.branchAttachedToId) ?? '-',
    contactPerson: branch.contactPerson,
    emailId: branch.emailId,
    phoneNo1: formatPhone(branch.phoneNo1CountryCode, branch.phoneNo1),
  }));

  const columns: TableColumnDef<BranchProfileTableRow>[] = [
    { accessorKey: 'branchName', header: 'Branch Name' },
    { accessorKey: 'branchCode', header: 'Branch Code' },
    { accessorKey: 'branchNo', header: 'Branch No' },
    { accessorKey: 'city', header: 'City' },
    { accessorKey: 'state', header: 'State' },
    { accessorKey: 'locationType', header: 'Location Type' },
    { accessorKey: 'operationalGroup', header: 'Operational Group' },
    { accessorKey: 'branchAttachedTo', header: 'Branch Attached To' },
    { accessorKey: 'contactPerson', header: 'Contact Person' },
    { accessorKey: 'phoneNo1', header: 'Phone No.1' },
    { accessorKey: 'emailId', header: 'Email ID' },
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
              variant="ghost"
              size="icon"
              className="rounded-sm bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
              onClick={event => {
                event.stopPropagation();
                navigate(`/master/system-setups/branch-profile/edit/${branchId}`);
              }}
            >
              <PencilSquareIcon className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              aria-label="Delete branch"
              variant="ghost"
              size="icon"
              disabled={isDeleting}
              className="rounded-sm bg-transparent text-error-600 hover:bg-error-50 hover:text-error-700"
              onClick={async event => {
                event.stopPropagation();
                const shouldDelete = window.confirm(
                  'Are you sure you want to delete this branch?'
                );

                if (shouldDelete) {
                  await onDelete(branchId);
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
        navigate(`/master/system-setups/branch-profile/edit/${row.id}`);
      }}
      emptyMessage="No branches found. Create your first branch."
    />
  );
};
