import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table';
import type { ICompanyProfile } from '../types';

interface CompanyProfileTableProps {
  companies: ICompanyProfile[];
  onDelete: (id: string) => void | Promise<void>;
  isDeleting?: boolean;
}

interface CompanyProfileTableRow {
  id: string;
  name: string;
  shortCode: string;
  panNo: string;
  cinNo: string;
  website: string;
  email: string;
}

export const CompanyProfileTable = ({
  companies,
  onDelete,
  isDeleting = false,
}: CompanyProfileTableProps) => {
  const navigate = useNavigate();

  const rows: CompanyProfileTableRow[] = useMemo(
    () =>
      companies.map(company => ({
        id: company.id,
        name: company.name || '-',
        shortCode: company.shortCode || '-',
        panNo: company.panNo || '-',
        cinNo: company.cinNo || '-',
        website: company.website || '-',
        email: company.email || '-',
      })),
    [companies]
  );

  const columns: TableColumnDef<CompanyProfileTableRow>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'shortCode', header: 'Short Code' },
    { accessorKey: 'panNo', header: 'PAN No.' },
    { accessorKey: 'cinNo', header: 'CIN No.' },
    { accessorKey: 'website', header: 'Website' },
    { accessorKey: 'email', header: 'Email' },
    {
      id: 'actions',
      header: 'Actions',
      meta: {
        headerClassName:
          'sticky right-0 z-20 border-l border-border-primary bg-surface-secondary w-28',
        cellClassName:
          'sticky right-0 z-10 border-l border-border-primary bg-surface-primary w-28',
      },
      cell: ({ row }) => {
        const companyId = row.original.id;

        return (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              aria-label="Edit company profile"
              className="border-0! bg-transparent! text-black! p-1!"
              onClick={event => {
                event.stopPropagation();
                navigate(`/admin/company-profile/edit/${companyId}`);
              }}
            >
              <PencilSquareIcon className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              aria-label="Delete company profile"
              className="border-0! bg-transparent! text-error-600 hover:text-error-700! p-1!"
              disabled={isDeleting}
              onClick={async event => {
                event.stopPropagation();
                if (window.confirm('Are you sure you want to delete this company?')) {
                  await onDelete(companyId);
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
        navigate(`/admin/company-profile/edit/${row.id}`);
      }}
      emptyMessage="No companies found. Create your first company profile."
    />
  );
};
