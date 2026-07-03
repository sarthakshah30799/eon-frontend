import { useMemo, useState } from 'react';
import { Checkbox, SelectEntity, type TableColumnDef } from '@/components/ui';
import { useListCurrencyProfiles } from '../hooks';
import type { ICurrencyProfile } from '../types';

interface SelectCurrencyProfilesProps {
  open: boolean;
  selectable?: boolean;
  multiple?: boolean;
  title?: string;
  description?: string;
  onContinue: (currencies: ICurrencyProfile[]) => void;
  onClose: () => void;
}

type SelectableCurrencyProfileRow = ICurrencyProfile & {
  rowKey: string;
};

const buildCurrencyColumns = (
  selectable: boolean,
  multiple: boolean
): TableColumnDef<SelectableCurrencyProfileRow>[] => {
  const columns: TableColumnDef<SelectableCurrencyProfileRow>[] = [
    {
      id: 'currencyCode',
      accessorKey: 'currencyCode',
      header: 'Code',
    },
    {
      id: 'currencyName',
      accessorKey: 'currencyName',
      header: 'Name',
    },
    {
      id: 'country',
      header: 'Country',
      cell: ({ row }) => row.original.country?.name || '-',
    },
    {
      id: 'pricingGroup',
      header: 'Pricing Group',
      cell: ({ row }) => row.original.pricingGroup?.name || '-',
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (row.original.active ? 'Active' : 'Inactive'),
    },
  ];

  if (!selectable) {
    return columns;
  }

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <div className="flex justify-center">
          <Checkbox
          checked={table.getIsAllRowsSelected()}
          onChange={checked => {
            table.toggleAllRowsSelected(checked);
          }}
          disabled={!multiple}
          aria-label="Select all currencies"
          className="shrink-0"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Checkbox
          checked={row.getIsSelected()}
          onChange={checked => row.toggleSelected(checked)}
          aria-label={`Select ${row.original.currencyCode}`}
          className="shrink-0"
          />
        </div>
      ),
      enableSorting: false,
      meta: {
        headerClassName: 'w-14',
        cellClassName: 'w-14',
      },
    },
    ...columns,
  ];
};

export const SelectCurrencyProfiles = ({
  open,
  selectable = true,
  multiple = false,
  title = 'Select Currency',
  description = 'Search and choose a currency from the list.',
  onContinue,
  onClose,
}: SelectCurrencyProfilesProps) => {
  const [search, setSearch] = useState('');

  const { data: currencies = [], isLoading, isFetching } =
    useListCurrencyProfiles(search);

  const rows = useMemo<SelectableCurrencyProfileRow[]>(
    () =>
      currencies.map(currency => ({
        ...currency,
        rowKey: currency.id,
      })),
    [currencies]
  );

  const columns = useMemo(
    () => buildCurrencyColumns(selectable, multiple),
    [multiple, selectable]
  );

  return (
    <SelectEntity<SelectableCurrencyProfileRow>
      open={open}
      title={title}
      description={description}
      columns={columns}
      data={rows}
      loading={isLoading || isFetching}
      selectable={selectable}
      multiple={multiple}
      searchValue={search}
      onSearch={value => setSearch(value)}
      searchPlaceholder="Search currency code, name, or country"
      emptyMessage="No currencies found."
      onContinue={selectedRows =>
        onContinue(
          selectedRows.map(row => {
            const { rowKey, ...currency } = row;
            void rowKey;
            return currency;
          })
        )
      }
      onClose={onClose}
      getRowId={row => row.rowKey}
    />
  );
};

export default SelectCurrencyProfiles;
