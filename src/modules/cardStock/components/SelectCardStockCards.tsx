import { useMemo } from 'react';
import { Checkbox, SelectEntity, type TableColumnDef } from '@/components/ui';
import { cardStockApi, type CardStockSelectableCard } from '@/api/cardStock';
import { toDisplayDate } from '@/utils';
import { useQuery } from '@tanstack/react-query';

export type SelectCardStockCardsMode =
  | 'available'
  | 'reload'
  | 'sold'
  | 'em-units';

interface SelectCardStockCardsProps {
  open: boolean;
  mode?: SelectCardStockCardsMode;
  /** @deprecated use mode="reload" */
  reload?: boolean;
  multiCurrency?: boolean;
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
  mode,
  reload = false,
  multiCurrency = false,
  branchId,
  passengerId = '',
  currencyId,
  productId,
  issuerPartyProfileId,
  onContinue,
  onClose,
}: SelectCardStockCardsProps) => {
  const resolvedMode: SelectCardStockCardsMode =
    mode ?? (reload ? 'reload' : 'available');

  const query = useQuery({
    queryKey: [
      'card-stock',
      resolvedMode,
      branchId,
      passengerId,
      multiCurrency ? 'any-currency' : currencyId,
      productId,
      issuerPartyProfileId,
    ],
    queryFn: () => {
      if (resolvedMode === 'sold') {
        return cardStockApi.searchSoldCards({
          currencyId: currencyId || undefined,
          issuerPartyProfileId: issuerPartyProfileId || undefined,
          limit: 100,
        });
      }
      if (resolvedMode === 'em-units') {
        return cardStockApi.listEmUnits({
          branchId,
          productId,
          issuerPartyProfileId: issuerPartyProfileId || undefined,
          currencyId: currencyId || undefined,
        });
      }
      if (resolvedMode === 'reload') {
        return cardStockApi.listReloadCards({
          branchId,
          passengerId,
          currencyId: multiCurrency ? '' : currencyId,
          productId,
          issuerPartyProfileId,
        });
      }
      return cardStockApi.listAvailableCards({
        branchId,
        currencyId: multiCurrency ? '' : currencyId,
        productId,
        issuerPartyProfileId,
      });
    },
    enabled:
      open &&
      (resolvedMode === 'sold'
        ? true
        : resolvedMode === 'em-units'
          ? Boolean(branchId && productId)
          : Boolean(
              branchId &&
                productId &&
                issuerPartyProfileId &&
                (multiCurrency || currencyId) &&
                (resolvedMode !== 'reload' || passengerId)
            )),
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

  const title =
    resolvedMode === 'sold'
      ? 'Select sold CARD'
      : resolvedMode === 'em-units'
        ? 'Select EM unit'
        : resolvedMode === 'reload'
          ? 'Select reload CARD'
          : 'Select CARD';

  return (
    <SelectEntity
      open={open}
      title={title}
      description={
        resolvedMode === 'sold'
          ? 'Pick a company-wide sold CC/CM card for EM surrender.'
          : resolvedMode === 'em-units'
            ? 'Pick a reserved EM unit at this branch for issuer sale.'
            : 'Select an eligible CARD for this line.'
      }
      data={query.data ?? []}
      columns={columns}
      loading={query.isLoading || query.isFetching}
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
