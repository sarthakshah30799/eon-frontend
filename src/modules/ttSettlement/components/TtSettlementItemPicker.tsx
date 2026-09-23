import { useMemo, useState } from 'react';
import { Button, Modal, Table, type TableColumnDef } from '@/components/ui';
import type { TtUnsettledItem } from '@/api/ttSettlement';
import { TT_SETTLEMENT_TEXT } from '../constants/ttSettlementConstants';

interface Props {
  open: boolean;
  items: TtUnsettledItem[];
  selectedIds: string[];
  loading?: boolean;
  showBranch?: boolean;
  onClose: () => void;
  onApply: (items: TtUnsettledItem[]) => void;
}

const snapshotLabel = (
  snapshot: TtUnsettledItem['branchSnapshot'],
  fallback: string
) => snapshot?.label ?? snapshot?.name ?? snapshot?.code ?? fallback;

export const TtSettlementItemPicker = ({
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
  const columns: TableColumnDef<TtUnsettledItem>[] = [
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
            ? TT_SETTLEMENT_TEXT.selected
            : TT_SETTLEMENT_TEXT.select}
        </Button>
      ),
    },
    {
      accessorKey: 'dealNo',
      header: TT_SETTLEMENT_TEXT.dealNo,
      cell: ({ row }) => row.original.dealNo ?? '-',
    },
    ...(showBranch
      ? [
          {
            id: 'branch',
            header: TT_SETTLEMENT_TEXT.sellingBranch,
            cell: ({ row }: { row: { original: TtUnsettledItem } }) =>
              snapshotLabel(row.original.branchSnapshot, row.original.branchId),
          } satisfies TableColumnDef<TtUnsettledItem>,
        ]
      : []),
    { accessorKey: 'feAmount', header: TT_SETTLEMENT_TEXT.feAmount },
    { accessorKey: 'dealRate', header: TT_SETTLEMENT_TEXT.dealRate },
    {
      accessorKey: 'bookingRate',
      header: TT_SETTLEMENT_TEXT.bookingRate,
      cell: ({ row }) => row.original.bookingRate ?? '-',
    },
  ];
  return (
    <Modal
      open={open}
      onOpenChange={value => {
        if (!value) onClose();
      }}
      title={TT_SETTLEMENT_TEXT.selectItems}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {TT_SETTLEMENT_TEXT.close}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onApply(items.filter(item => selectedSet.has(item.id)));
              onClose();
            }}
          >
            {`${TT_SETTLEMENT_TEXT.apply} (${selection.length})`}
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
        emptyMessage={TT_SETTLEMENT_TEXT.emptyUnsettled}
      />
    </Modal>
  );
};
