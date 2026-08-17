import { useMemo, useState } from 'react';
import { Button, Modal, Table, type TableColumnDef } from '@/components/ui';
import type { CardStockUnsettledItem } from '@/api/cardSettlement';
import { CARD_SETTLEMENT_TEXT } from '../constants/cardSettlementConstants';

interface Props {
  open: boolean;
  items: CardStockUnsettledItem[];
  selectedIds: string[];
  loading?: boolean;
  showBranch?: boolean;
  onClose: () => void;
  onApply: (items: CardStockUnsettledItem[]) => void;
}

const snapshotLabel = (
  snapshot: CardStockUnsettledItem['branchSnapshot'],
  fallback: string
) => snapshot?.label ?? snapshot?.name ?? snapshot?.code ?? fallback;

export const CardSettlementItemPicker = ({
  open,
  items,
  selectedIds,
  loading,
  showBranch = false,
  onClose,
  onApply,
}: Props) => {
  const [selection, setSelection] = useState<string[]>(selectedIds);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSelection(selectedIds);
    }
  }
  const selectedSet = useMemo(() => new Set(selection), [selection]);
  const columns: TableColumnDef<CardStockUnsettledItem>[] = [
    {
      id: 'select',
      header: '',
      cell: ({ row }) => (
        <Button
          type="button"
          size="sm"
          variant={selectedSet.has(row.original.id) ? 'default' : 'outline'}
          onClick={() =>
            setSelection(current =>
              current.includes(row.original.id)
                ? current.filter(id => id !== row.original.id)
                : [...current, row.original.id]
            )
          }
        >
          {selectedSet.has(row.original.id)
            ? CARD_SETTLEMENT_TEXT.selected
            : CARD_SETTLEMENT_TEXT.select}
        </Button>
      ),
    },
    { accessorKey: 'maskedCardNumber', header: CARD_SETTLEMENT_TEXT.cardNumber },
    { accessorKey: 'series', header: CARD_SETTLEMENT_TEXT.series },
    { accessorKey: 'kitNumber', header: CARD_SETTLEMENT_TEXT.kitNumber },
    ...(showBranch
      ? [
          {
            id: 'branch',
            header: CARD_SETTLEMENT_TEXT.sellingBranch,
            cell: ({
              row,
            }: {
              row: { original: CardStockUnsettledItem };
            }) => snapshotLabel(row.original.branchSnapshot, row.original.branchId),
          } satisfies TableColumnDef<CardStockUnsettledItem>,
        ]
      : []),
    { accessorKey: 'saleKind', header: CARD_SETTLEMENT_TEXT.saleKind },
    { accessorKey: 'denomination', header: CARD_SETTLEMENT_TEXT.denomination },
    { accessorKey: 'saleBuyRate', header: CARD_SETTLEMENT_TEXT.rate },
  ];
  return (
    <Modal
      open={open}
      onOpenChange={value => {
        if (!value) onClose();
      }}
      title={CARD_SETTLEMENT_TEXT.selectCards}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {CARD_SETTLEMENT_TEXT.close}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onApply(items.filter(item => selectedSet.has(item.id)));
              onClose();
            }}
          >
            {`${CARD_SETTLEMENT_TEXT.apply} (${selection.length})`}
          </Button>
        </div>
      }
    >
      <Table
        columns={columns}
        data={items}
        loading={loading}
        enableSorting={false}
        enableFiltering={false}
        enablePagination={false}
        emptyMessage={CARD_SETTLEMENT_TEXT.emptyUnsettled}
      />
    </Modal>
  );
};
