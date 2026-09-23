import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Checkbox, SelectEntity, type TableColumnDef } from '@/components/ui';
import {
  DealCoverStatus,
  dealCoverRateApi,
  type IDealCoverRate,
} from '@/api/dealCoverRate';
import { toDisplayDate } from '@/utils';

interface DealCoverSelectModalProps {
  open: boolean;
  branchId: string;
  productId?: string;
  currencyId?: string;
  issuerPartyProfileId?: string;
  excludeDealIds?: string[];
  onContinue: (deal: IDealCoverRate) => void;
  onClose: () => void;
}

export const DealCoverSelectModal = ({
  open,
  branchId,
  productId = '',
  currencyId = '',
  issuerPartyProfileId = '',
  excludeDealIds = [],
  onContinue,
  onClose,
}: DealCoverSelectModalProps) => {
  const query = useQuery({
    queryKey: [
      'deal-covers',
      'selectable',
      branchId,
      productId,
      currencyId,
      issuerPartyProfileId,
    ],
    queryFn: () =>
      dealCoverRateApi.listAll({
        status: DealCoverStatus.APPROVED,
        branchId: branchId || undefined,
        productId: productId || undefined,
        currencyId: currencyId || undefined,
        issuerPartyProfileId: issuerPartyProfileId || undefined,
      }),
    enabled: open && Boolean(branchId),
  });

  const excluded = useMemo(
    () => new Set(excludeDealIds.filter(Boolean)),
    [excludeDealIds]
  );

  const rows = useMemo(
    () =>
      (query.data ?? []).filter(deal => {
        if (deal.consumedTransactionItemId || deal.consumedTransactionId) {
          return false;
        }
        return !excluded.has(deal.id);
      }),
    [excluded, query.data]
  );

  const columns = useMemo<TableColumnDef<IDealCoverRate>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <div className="flex justify-center">
            <Checkbox
              checked={table.getIsAllRowsSelected()}
              onChange={checked => table.toggleAllRowsSelected(checked)}
              disabled
              aria-label="Select all deals"
              className="shrink-0"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onChange={checked => row.toggleSelected(checked)}
              aria-label={`Select deal ${row.original.dealNo || row.original.id}`}
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
      {
        id: 'dealNo',
        accessorKey: 'dealNo',
        header: 'Deal No',
        cell: ({ row }) => row.original.dealNo || '-',
      },
      {
        id: 'transactionDate',
        accessorKey: 'transactionDate',
        header: 'Deal Date',
        cell: ({ row }) => toDisplayDate(row.original.transactionDate) || '-',
      },
      {
        id: 'currency',
        header: 'Currency',
        cell: ({ row }) =>
          row.original.currencySnapshot?.currencyCode ||
          row.original.currencySnapshot?.code ||
          '-',
      },
      {
        id: 'product',
        header: 'Product',
        cell: ({ row }) =>
          row.original.productSnapshot?.productCode ||
          row.original.productSnapshot?.code ||
          '-',
      },
      {
        id: 'issuer',
        header: 'Issuer',
        cell: ({ row }) =>
          row.original.issuerPartyProfileSnapshot?.name ||
          row.original.issuerPartyProfileSnapshot?.code ||
          '-',
      },
      { id: 'feAmount', accessorKey: 'feAmount', header: 'FE Amount' },
      { id: 'dealRate', accessorKey: 'dealRate', header: 'Deal Rate' },
      {
        id: 'passenger',
        header: 'Passenger',
        cell: ({ row }) =>
          row.original.passengerName ||
          row.original.passengerPan ||
          row.original.passengerPassport ||
          '-',
      },
    ],
    []
  );

  return (
    <SelectEntity<IDealCoverRate>
      open={open}
      title="Select TT deal cover"
      description="Only approved, unconsumed deals are shown. Maturity is rechecked on save."
      columns={columns}
      data={rows}
      loading={query.isLoading || query.isFetching}
      selectable
      multiple={false}
      searchValue=""
      onSearch={() => undefined}
      searchPlaceholder="Search deals"
      emptyMessage={
        query.error instanceof Error
          ? query.error.message
          : 'No selectable TT deals found.'
      }
      getRowId={deal => deal.id}
      onContinue={selected => {
        if (selected[0]) onContinue(selected[0]);
      }}
      onClose={onClose}
    />
  );
};

export default DealCoverSelectModal;
