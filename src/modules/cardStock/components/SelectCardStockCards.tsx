import { useQuery } from '@tanstack/react-query';
import { SelectEntity, type TableColumnDef } from '@/components/ui';
import { cardStockApi, type CardStockSelectableCard } from '@/api/cardStock';
import { formatDateTime } from '@/utils';

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

export const SelectCardStockCards = ({ open, reload = false, branchId, passengerId = '', currencyId, productId, issuerPartyProfileId, onContinue, onClose }: SelectCardStockCardsProps) => {
  const query = useQuery({
    queryKey: ['card-stock', reload ? 'reload-cards' : 'available-cards', branchId, passengerId, currencyId, productId, issuerPartyProfileId],
    queryFn: () => reload ? cardStockApi.listReloadCards({ branchId, passengerId, currencyId, productId, issuerPartyProfileId }) : cardStockApi.listAvailableCards({ branchId, currencyId, productId, issuerPartyProfileId }),
    enabled: open && Boolean(branchId && currencyId && productId && issuerPartyProfileId && (!reload || passengerId)),
  });
  const columns: TableColumnDef<CardStockSelectableCard>[] = [
    { id: 'series', accessorKey: 'series', header: 'Series' },
    { id: 'kitNumber', accessorKey: 'kitNumber', header: 'Kit Number' },
    { id: 'cardNumber', accessorKey: 'maskedCardNumber', header: 'Card Number' },
    { id: 'denomination', accessorKey: 'denomination', header: 'Denomination' },
    { id: 'expirationDate', accessorKey: 'expirationDate', header: 'Expiration', cell: ({ row }) => formatDateTime(`${row.original.expirationDate}T00:00:00`, 'DD/MM/YYYY') },
  ];
  return <SelectEntity<CardStockSelectableCard> open={open} title={reload ? 'Select CARD for reload' : 'Select CARD'} description="Only eligible cards for the selected branch and issuer are shown." columns={columns} data={query.data ?? []} loading={query.isLoading || query.isFetching} selectable multiple={false} searchValue="" onSearch={() => undefined} searchPlaceholder="Search cards" emptyMessage={query.error instanceof Error ? query.error.message : 'No eligible cards found.'} onContinue={rows => { if (rows[0]) onContinue(rows[0]); }} onClose={onClose} />;
};
