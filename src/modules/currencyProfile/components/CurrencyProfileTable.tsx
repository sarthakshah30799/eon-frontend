import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table';
import type { ICurrencyProfile } from '../types';

interface CurrencyProfileTableProps {
  currencies: ICurrencyProfile[];
}

interface CurrencyProfileTableRow {
  id: string;
  currencyCode: string;
  currencyName: string;
  countryName: string;
  priority: string;
  ratePer: string;
  calculationMethod: string;
  group: string;
  pricingGroup: string;
  active: boolean;
  onlyStocking: boolean;
}

export const CurrencyProfileTable = ({
  currencies,
}: CurrencyProfileTableProps) => {
  const navigate = useNavigate();

  const rows: CurrencyProfileTableRow[] = currencies.map(currency => ({
    id: currency.id,
    currencyCode: currency.currencyCode,
    currencyName: currency.currencyName,
    countryName: currency.country?.name || '-',
    priority: currency.priority || '-',
    ratePer: currency.ratePer || '-',
    calculationMethod: currency.calculationMethod,
    group: currency.group,
    pricingGroup: currency.pricingGroup?.name || '-',
    active: currency.active,
    onlyStocking: currency.onlyStocking,
  }));

  const columns: TableColumnDef<CurrencyProfileTableRow>[] = [
    { accessorKey: 'currencyCode', header: 'Currency Code' },
    { accessorKey: 'currencyName', header: 'Currency Name' },
    { accessorKey: 'countryName', header: 'Country' },
    { accessorKey: 'priority', header: 'Priority' },
    { accessorKey: 'ratePer', header: 'Rate / Per' },
    {
      accessorKey: 'calculationMethod',
      header: 'Calculation Method',
    },
    { accessorKey: 'group', header: 'Group' },
    { accessorKey: 'pricingGroup', header: 'Pricing Group' },
    {
      accessorKey: 'active',
      header: 'Active',
      cell: ({ row }) => (row.original.active ? 'Yes' : 'No'),
    },
    {
      accessorKey: 'onlyStocking',
      header: 'Only Stocking',
      cell: ({ row }) => (row.original.onlyStocking ? 'Yes' : 'No'),
    },
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
        const currencyId = row.original.id;

        return (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              aria-label="Edit currency"
              variant="ghost"
              size="icon"
              className="rounded-sm bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
              onClick={event => {
                event.stopPropagation();
                navigate(`/currency-profile/edit/${currencyId}`);
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
      onRowClick={row =>
        navigate(`/currency-profile/edit/${row.id}`)
      }
      emptyMessage="No currencies found. Create your first currency."
    />
  );
};
