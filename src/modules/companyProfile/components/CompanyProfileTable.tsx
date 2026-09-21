import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import {
  Table,
  type TableColumnDef,
  TABLE_ACTIONS_CELL_CLASSNAME,
  TABLE_ACTION_BUTTON_CLASSNAME,
  TABLE_ACTION_DELETE_BUTTON_CLASSNAME,
  TABLE_ACTION_ICON_CLASSNAME,
} from '@/components/ui/table';
import type { PaginationControlsProps } from '@/components/ui';
import type { ICompanyProfile } from '../types';

interface CompanyProfileTableProps extends PaginationControlsProps {
  companies: ICompanyProfile[];
  onDelete: (id: string) => void | Promise<void>;
  isDeleting?: boolean;
  loading?: boolean;
  isFetching?: boolean;
  onSearch?: (value: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
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
  loading = false,
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
        headerClassName: 'w-28',
        cellClassName: 'w-28',
      },
      cell: ({ row }) => {
        const companyId = row.original.id;

        return (
          <div className={TABLE_ACTIONS_CELL_CLASSNAME}>
            <Button
              type="button"
              aria-label="Edit company profile"
              variant="ghost"
              size="icon"
              className={TABLE_ACTION_BUTTON_CLASSNAME}
              onClick={event => {
                event.stopPropagation();
                navigate(`/admin/company-profile/edit/${companyId}`);
              }}
            >
              <PencilSquareIcon className={TABLE_ACTION_ICON_CLASSNAME} />
            </Button>
            <Button
              type="button"
              aria-label="Delete company profile"
              variant="ghost"
              size="icon"
              className={TABLE_ACTION_DELETE_BUTTON_CLASSNAME}
              disabled={isDeleting}
              onClick={async event => {
                event.stopPropagation();
                if (
                  window.confirm(
                    'Are you sure you want to delete this company?'
                  )
                ) {
                  await onDelete(companyId);
                }
              }}
            >
              <TrashIcon className={TABLE_ACTION_ICON_CLASSNAME} />
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
        navigate(`/admin/company-profile/edit/${row.id}`);
      }}
      emptyMessage="No companies found. Create your first company profile."
    />
  );
};
