import { useMemo, useState } from 'react';
import { Checkbox, SelectEntity, type TableColumnDef } from '@/components/ui';
import { useDebounce } from '@/hooks';
import { toDisplayDate } from '@/utils';
import { AVAILABLE_ADVANCE_TEXT } from '../constants';
import { useAvailableAdvances, type AvailableAdvanceQueryParams } from '../hooks';
import type { AvailableAdvance } from '../types';
import { formatAdvanceAccountLabel } from '../utils';

const EMPTY_AVAILABLE_ADVANCES: AvailableAdvance[] = [];

interface SelectAvailableAdvancesProps {
  open: boolean;
  type: 'RECEIPT' | 'PAYMENT';
  params: AvailableAdvanceQueryParams;
  remainingAmount?: string | number;
  excludedVoucherIds?: string[];
  selectedVoucherIds?: string[];
  onContinue: (advances: AvailableAdvance[]) => void;
  onClose: () => void;
}

const formatAmount = (value?: string | number | null) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric.toFixed(2) : '0.00';
};

const buildColumns = (): TableColumnDef<AvailableAdvance>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex justify-center">
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          onChange={checked => table.toggleAllRowsSelected(checked)}
          aria-label={AVAILABLE_ADVANCE_TEXT.selectAll}
          className="shrink-0"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onChange={checked => row.toggleSelected(checked)}
          aria-label={`Select ${row.original.number}`}
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
    id: 'number',
    accessorKey: 'number',
    header: AVAILABLE_ADVANCE_TEXT.number,
  },
  {
    id: 'transactionDate',
    accessorKey: 'transactionDate',
    header: AVAILABLE_ADVANCE_TEXT.date,
    cell: ({ row }) => toDisplayDate(row.original.transactionDate) || '-',
  },
  {
    id: 'account',
    header: AVAILABLE_ADVANCE_TEXT.account,
    cell: ({ row }) =>
      formatAdvanceAccountLabel(row.original.advanceControlAccountSnapshot) || '-',
  },
  {
    id: 'availableAmount',
    accessorKey: 'availableAmount',
    header: AVAILABLE_ADVANCE_TEXT.availableAmount,
    cell: ({ row }) => formatAmount(row.original.availableAmount),
  },
  {
    id: 'chequeNumber',
    accessorKey: 'chequeNumber',
    header: AVAILABLE_ADVANCE_TEXT.chequeNumber,
    cell: ({ row }) => row.original.chequeNumber || '-',
  },
];

export const SelectAvailableAdvances = ({
  open,
  type,
  params,
  remainingAmount = '0.00',
  excludedVoucherIds = [],
  selectedVoucherIds = [],
  onContinue,
  onClose,
}: SelectAvailableAdvancesProps) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedVoucherIds);
  const [selectedAdvances, setSelectedAdvances] = useState<AvailableAdvance[]>([]);
  const debouncedSearch = useDebounce(search, 350);
  const canLoad = Boolean(
    params.partyProfileId &&
      params.branchId &&
      params.counterId &&
      params.transactionDate &&
      params.paymentMethod
  );
  const { data = EMPTY_AVAILABLE_ADVANCES, isLoading, isFetching, error } = useAvailableAdvances(
    type,
    params,
    open && canLoad
  );

  const rows = useMemo(() => {
    const excluded = new Set(
      excludedVoucherIds.filter(id => !selectedVoucherIds.includes(id))
    );
    const query = debouncedSearch.trim().toLowerCase();
    return data.filter(voucher => {
      if (excluded.has(voucher.id)) {
        return false;
      }
      if (!query) {
        return true;
      }
      const accountLabel = formatAdvanceAccountLabel(voucher.advanceControlAccountSnapshot);
      return [voucher.number, accountLabel, voucher.chequeNumber, voucher.availableAmount]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(query));
    });
  }, [data, debouncedSearch, excludedVoucherIds, selectedVoucherIds]);

  const accountLabel = useMemo(() => {
    const labels = Array.from(
      new Set(rows.map(row => formatAdvanceAccountLabel(row.advanceControlAccountSnapshot)).filter(Boolean))
    );
    return labels.length === 1 ? labels[0] : '';
  }, [rows]);

  const selectedTotal = selectedAdvances.reduce(
    (sum, advance) => sum + Number(advance.availableAmount || 0),
    0
  );
  const columns = useMemo(() => buildColumns(), []);

  return (
    <SelectEntity<AvailableAdvance>
      open={open}
      title={type === 'RECEIPT' ? AVAILABLE_ADVANCE_TEXT.titleReceipt : AVAILABLE_ADVANCE_TEXT.titlePayment}
      description={
        canLoad
          ? AVAILABLE_ADVANCE_TEXT.description(
              rows.length,
              accountLabel,
              formatAmount(remainingAmount)
            )
          : AVAILABLE_ADVANCE_TEXT.missingContext
      }
      columns={columns}
      data={rows}
      loading={isLoading || (isFetching && data.length === 0)}
      selectable
      multiple
      searchValue={search}
      onSearch={setSearch}
      searchPlaceholder={AVAILABLE_ADVANCE_TEXT.searchPlaceholder}
      emptyMessage={
        error instanceof Error ? error.message : AVAILABLE_ADVANCE_TEXT.empty
      }
      selectedRowIds={selectedIds}
      selectedRows={selectedAdvances}
      onSelectedRowIdsChange={nextIds => {
        setSelectedIds(nextIds);
        setSelectedAdvances(current => {
          const byId = new Map([
            ...current.map(advance => [advance.id, advance] as const),
            ...rows.map(advance => [advance.id, advance] as const),
          ]);
          return nextIds
            .map(id => byId.get(id))
            .filter((advance): advance is AvailableAdvance => Boolean(advance));
        });
      }}
      selectedSummary={
        selectedAdvances.length > 0 ? (
          <div className="rounded-sm border border-border-primary bg-surface-secondary p-3 text-sm text-text-primary">
            {AVAILABLE_ADVANCE_TEXT.selectedSummary(
              selectedAdvances.length,
              formatAmount(selectedTotal)
            )}
          </div>
        ) : null
      }
      getRowId={row => row.id}
      continueLabel={AVAILABLE_ADVANCE_TEXT.continueLabel}
      cancelLabel={AVAILABLE_ADVANCE_TEXT.cancelLabel}
      onContinue={selectedRows => {
        if (!selectedRows.length) {
          return;
        }
        onContinue(selectedRows);
      }}
      onClose={onClose}
    />
  );
};

export default SelectAvailableAdvances;
