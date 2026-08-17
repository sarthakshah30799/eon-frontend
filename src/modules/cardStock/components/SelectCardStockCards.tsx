import { useMemo } from 'react';
import { Checkbox, SelectEntity, type TableColumnDef } from '@/components/ui';
import { cardStockApi, type CardStockSelectableCard } from '@/api/cardStock';
import { toDisplayDate } from '@/utils';
import { useQuery } from '@tanstack/react-query';

interface SelectCardStockCardsProps {
  open: boolean;
  reload?: boolean;
  branchId: string;
  passengerId?: string;
  currencyId: string;
  productId: string;
  issuerPartyProfileId: string;
  onContinue: (card: CardStockSelectableCard) => void;
  onClose: () => void;
}

export const SelectCardStockCards = ({
  open,
  reload = false,
  branchId,
  passengerId = '',
  currencyId,
  productId,
  issuerPartyProfileId,
  onContinue,
  onClose,
}: SelectCardStockCardsProps) => {
  const query = useQuery({
    queryKey: [
      'card-stock',
      reload ? 'reload-cards' : 'available-cards',
      branchId,
      passengerId,
      currencyId,
      productId,
      issuerPartyProfileId,
    ],
    queryFn: () =>
      reload
        ? cardStockApi.listReloadCards({
            branchId,
            passengerId,
            currencyId,
            productId,
            issuerPartyProfileId,
          })
        : cardStockApi.listAvailableCards({
            branchId,
            currencyId,
            productId,
            issuerPartyProfileId,
          }),
    enabled:
      open &&
      Boolean(
        branchId &&
          currencyId &&
          productId &&
          issuerPartyProfileId &&
          (!reload || passengerId)
      ),
  });

  const columns = useMemo<TableColumnDef<CardStockSelectableCard>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <div className="flex justify-center">
            <Checkbox
              checked={table.getIsAllRowsSelected()}
              onChange={checked => table.toggleAllRowsSelected(checked)}
              disabled
              aria-label="Select all cards"
              className="shrink-0"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onChange={checked => row.toggleSelected(checked)}
              aria-label={`Select card ${row.original.maskedCardNumber || row.original.kitNumber}`}
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
      { id: 'series', accessorKey: 'series', header: 'Series' },
      { id: 'kitNumber', accessorKey: 'kitNumber', header: 'Kit Number' },
      {
        id: 'cardNumber',
        accessorKey: 'maskedCardNumber',
        header: 'Card Number',
      },
      {
        id: 'denomination',
        accessorKey: 'denomination',
        header: 'Denomination',
      },
      {
        id: 'expirationDate',
        accessorKey: 'expirationDate',
        header: 'Expiration',
        cell: ({ row }) => toDisplayDate(row.original.expirationDate) || '-',
      },
    ],
    []
  );

  return (
    <SelectEntity<CardStockSelectableCard>
      open={open}
      title={reload ? 'Select CARD for reload' : 'Select CARD'}
      description="Only eligible cards for the selected branch and issuer are shown."
      columns={columns}
      data={query.data ?? []}
      loading={query.isLoading || query.isFetching}
      selectable
      multiple={false}
      searchValue=""
      onSearch={() => undefined}
      searchPlaceholder="Search cards"
      emptyMessage={
        query.error instanceof Error
          ? query.error.message
          : 'No eligible cards found.'
      }
      getRowId={card => card.id}
      onContinue={rows => {
        if (rows[0]) onContinue(rows[0]);
      }}
      onClose={onClose}
    />
  );
};

export default SelectCardStockCards;
