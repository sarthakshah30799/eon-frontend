import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import {
  Table,
  type TableColumnDef,
  TABLE_ACTIONS_CELL_CLASSNAME,
  TABLE_ACTION_BUTTON_CLASSNAME,
  TABLE_ACTION_ICON_CLASSNAME,
} from '@/components/ui/table';
import type { PaginationControlsProps } from '@/components/ui';
import { usePermission } from '@/hooks';
import type { ICountryProfile } from '../types';

interface CountryProfileTableProps extends PaginationControlsProps {
  countries: ICountryProfile[];
  loading?: boolean;
  isFetching?: boolean;
  onSearch?: (value: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
}

interface CountryProfileTableRow {
  id: string;
  code: string;
  name: string;
  riskCategory: string;
  countryGroup: string;
}

export const CountryProfileTable = ({
  countries,
  loading = false,
  isFetching = false,
  onSearch,
  searchValue = '',
  searchPlaceholder = 'Search',
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: CountryProfileTableProps) => {
  const navigate = useNavigate();
  const { canModify, canView } = usePermission('/admin/country-profile');

  const rows: CountryProfileTableRow[] = countries.map(country => ({
    id: country.id,
    code: country.code,
    name: country.name,
    riskCategory: country.riskCategory,
    countryGroup: country.countryGroup?.name ?? '—',
  }));

  const columns: TableColumnDef<CountryProfileTableRow>[] = [
    { accessorKey: 'code', header: 'Country Code' },
    { accessorKey: 'name', header: 'Country Name' },
    { accessorKey: 'countryGroup', header: 'Country Group' },
    { accessorKey: 'riskCategory', header: 'Risk Category' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const countryId = row.original.id;

        if (!canModify && !canView) return null;

        return (
          <div className={TABLE_ACTIONS_CELL_CLASSNAME}>
            <Button
              type="button"
              aria-label={canModify ? 'Edit country' : 'View country'}
              variant="ghost"
              size="icon"
              className={TABLE_ACTION_BUTTON_CLASSNAME}
              onClick={event => {
                event.stopPropagation();
                navigate(`/admin/country-profile/edit/${countryId}`);
              }}
            >
              {canModify ? (
                <PencilSquareIcon className={TABLE_ACTION_ICON_CLASSNAME} />
              ) : (
                <EyeIcon className={TABLE_ACTION_ICON_CLASSNAME} />
              )}
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
      onRowClick={
        canModify || canView
          ? row => navigate(`/admin/country-profile/edit/${row.id}`)
          : undefined
      }
      emptyMessage="No countries found. Create your first country."
    />
  );
};
