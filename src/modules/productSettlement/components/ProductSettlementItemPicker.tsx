import { useMemo, useState } from 'react';
import { Button, Modal, Table, type TableColumnDef } from '@/components/ui';
import {
  ProductSettlementType,
  type ProductUnsettledItem,
} from '@/api/productSettlement';
import { PRODUCT_SETTLEMENT_TEXT } from '../constants/productSettlementConstants';
import {
  displayCardNumber,
  resolveProductCode,
  resolveSettlementType,
} from '../utils/productSettlementUtils';

interface Props {
  open: boolean;
  items: ProductUnsettledItem[];
  selectedIds: string[];
  loading?: boolean;
  showBranch?: boolean;
  onClose: () => void;
  onApply: (items: ProductUnsettledItem[]) => void;
}

const snapshotLabel = (
  snapshot: ProductUnsettledItem['branchSnapshot'],
  fallback: string
) => snapshot?.label ?? snapshot?.name ?? snapshot?.code ?? fallback;

export const ProductSettlementItemPicker = ({
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
  const columns: TableColumnDef<ProductUnsettledItem>[] = [
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
            ? PRODUCT_SETTLEMENT_TEXT.selected
            : PRODUCT_SETTLEMENT_TEXT.select}
        </Button>
      ),
    },
    {
      id: 'productCode',
      header: PRODUCT_SETTLEMENT_TEXT.productCode,
      cell: ({ row }) => resolveProductCode(row.original) || '-',
    },
    {
      id: 'type',
      header: PRODUCT_SETTLEMENT_TEXT.settlementType,
      cell: ({ row }) => resolveSettlementType(row.original),
    },
    {
      id: 'cardNumber',
      header: PRODUCT_SETTLEMENT_TEXT.cardNumber,
      cell: ({ row }) => displayCardNumber(row.original),
    },
    {
      accessorKey: 'series',
      header: PRODUCT_SETTLEMENT_TEXT.series,
      cell: ({ row }) =>
        resolveSettlementType(row.original) === ProductSettlementType.TT
          ? row.original.series || '-'
          : row.original.series || '-',
    },
    {
      id: 'kitNumber',
      header: PRODUCT_SETTLEMENT_TEXT.kitNumber,
      cell: ({ row }) =>
        resolveSettlementType(row.original) === ProductSettlementType.CARD
          ? row.original.kitNumber || '-'
          : '-',
    },
    ...(showBranch
      ? [
          {
            id: 'branch',
            header: PRODUCT_SETTLEMENT_TEXT.sellingBranch,
            cell: ({ row }: { row: { original: ProductUnsettledItem } }) =>
              snapshotLabel(row.original.branchSnapshot, row.original.branchId),
          } satisfies TableColumnDef<ProductUnsettledItem>,
        ]
      : []),
    {
      id: 'saleKind',
      header: PRODUCT_SETTLEMENT_TEXT.saleKind,
      cell: ({ row }) => row.original.saleKind || '-',
    },
    {
      accessorKey: 'denomination',
      header: PRODUCT_SETTLEMENT_TEXT.denomination,
    },
    {
      id: 'bookingRate',
      header: PRODUCT_SETTLEMENT_TEXT.bookingRate,
      cell: ({ row }) => row.original.bookingRate || '-',
    },
    { accessorKey: 'saleBuyRate', header: PRODUCT_SETTLEMENT_TEXT.rate },
  ];
  return (
    <Modal
      open={open}
      onOpenChange={value => {
        if (!value) onClose();
      }}
      title={PRODUCT_SETTLEMENT_TEXT.selectItems}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {PRODUCT_SETTLEMENT_TEXT.close}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onApply(items.filter(item => selectedSet.has(item.id)));
              onClose();
            }}
          >
            {`${PRODUCT_SETTLEMENT_TEXT.apply} (${selection.length})`}
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
        emptyMessage={PRODUCT_SETTLEMENT_TEXT.emptyUnsettled}
      />
    </Modal>
  );
};
