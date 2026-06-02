import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table';
import type { ICountryProfile } from '../types';

interface CountryProfileTableProps {
  countries: ICountryProfile[];
}

interface CountryProfileTableRow {
  id: string;
  code: string;
  name: string;
  riskCategory: string;
}

export const CountryProfileTable = ({
  countries,
}: CountryProfileTableProps) => {
  const navigate = useNavigate();

  const rows: CountryProfileTableRow[] = countries.map(country => ({
    id: country.id,
    code: country.code,
    name: country.name,
    riskCategory: country.riskCategory,
  }));

  const columns: TableColumnDef<CountryProfileTableRow>[] = [
    { accessorKey: 'code', header: 'Country Code' },
    { accessorKey: 'name', header: 'Country Name' },
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

        return (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              aria-label="Edit country"
              variant="ghost"
              size="icon"
              className="rounded-sm bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
              onClick={event => {
                event.stopPropagation();
                navigate(`/master/system-setups/country-profile/edit/${countryId}`);
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
      enableRowSelection={false}
      enableColumnVisibility={false}
      onRowClick={row => {
        navigate(`/master/system-setups/country-profile/edit/${row.id}`);
      }}
      emptyMessage="No countries found. Create your first country."
    />
  );
};
