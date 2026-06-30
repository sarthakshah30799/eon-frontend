import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table';
import { usePermission } from '@/hooks';
import type { ICountryProfile } from '../types';

interface CountryProfileTableProps {
  countries: ICountryProfile[];
  loading?: boolean;
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
  onSearch,
  searchValue = '',
  searchPlaceholder = 'Search',
}: CountryProfileTableProps) => {
  const navigate = useNavigate();
  const { canModify, canView } = usePermission(
    '/admin/country-profile'
  );

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
      meta: {
        headerClassName:
          'sticky right-0 z-20 border-l border-border-primary bg-surface-secondary',
        cellClassName:
          'sticky right-0 z-10 border-l border-border-primary bg-surface-primary',
      },
      cell: ({ row }) => {
        const countryId = row.original.id;

        if (!canModify && !canView) return null;

        return (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              aria-label={canModify ? 'Edit country' : 'View country'}
              variant="ghost"
              size="icon"
              className="rounded-sm bg-transparent text-black! hover:bg-surface-secondary hover:text-text-primary"
              onClick={event => {
                event.stopPropagation();
                navigate(`/admin/country-profile/edit/${countryId}`);
              }}
            >
              {canModify ? (
                <PencilSquareIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
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
      enableRowSelection={false}
      enableColumnVisibility={false}
      loading={loading}
      onSearch={onSearch}
      searchValue={searchValue}
      searchPlaceholder={searchPlaceholder}
      onRowClick={
        canModify || canView
          ? row =>
              navigate(`/admin/country-profile/edit/${row.id}`)
          : undefined
      }
      emptyMessage="No countries found. Create your first country."
    />
  );
};
