import { useMemo, useState } from 'react';
import { Checkbox, SelectEntity, type TableColumnDef } from '@/components/ui';
import { useDebounce } from '@/hooks';
import { toDisplayDate } from '@/utils';
import { OUTSTANDING_BILL_TEXT } from '../constants';
import {
  useOutstandingBills,
  type OutstandingBillQueryParams,
} from '../hooks';
import type { OutstandingBill } from '../types';
import { formatOutstandingBillPassengerLabel } from '../utils';

const EMPTY_OUTSTANDING_BILLS: OutstandingBill[] = [];

interface SelectOutstandingBillsProps {
  open: boolean;
  type: 'RECEIPT' | 'PAYMENT';
  params: OutstandingBillQueryParams;
  itemTypeLabel?: string;
  excludedTransactionIds?: string[];
  selectedTransactionIds?: string[];
  onContinue: (bills: OutstandingBill[]) => void;
  onClose: () => void;
}

const formatAmount = (value?: string | number | null) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric.toFixed(2) : '0.00';
};

const paidAmount = (bill: OutstandingBill) =>
  Number(bill.byCash || 0) + Number(bill.byCheque || 0);

const buildColumns = (): TableColumnDef<OutstandingBill>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex justify-center">
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          onChange={checked => table.toggleAllRowsSelected(checked)}
          aria-label={OUTSTANDING_BILL_TEXT.selectAll}
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
    header: OUTSTANDING_BILL_TEXT.number,
  },
  {
    id: 'transactionDate',
    accessorKey: 'transactionDate',
    header: OUTSTANDING_BILL_TEXT.date,
    cell: ({ row }) => toDisplayDate(row.original.transactionDate) || '-',
  },
  {
    id: 'passenger',
    header: OUTSTANDING_BILL_TEXT.passenger,
    cell: ({ row }) =>
      formatOutstandingBillPassengerLabel(row.original.passengerSnapshot),
  },
  {
    id: 'finalAmount',
    accessorKey: 'finalAmount',
    header: OUTSTANDING_BILL_TEXT.finalAmount,
    cell: ({ row }) => formatAmount(row.original.finalAmount),
  },
  {
    id: 'paidAmount',
    header: OUTSTANDING_BILL_TEXT.paidAmount,
    cell: ({ row }) => formatAmount(paidAmount(row.original)),
  },
  {
    id: 'outstanding',
    accessorKey: 'outstanding',
    header: OUTSTANDING_BILL_TEXT.outstanding,
    cell: ({ row }) => formatAmount(row.original.outstanding),
  },
];

export const SelectOutstandingBills = ({
  open,
  type,
  params,
  itemTypeLabel = '',
  excludedTransactionIds = [],
  selectedTransactionIds = [],
  onContinue,
  onClose,
}: SelectOutstandingBillsProps) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(
    selectedTransactionIds
  );
  const [selectedBills, setSelectedBills] = useState<OutstandingBill[]>([]);
  const debouncedSearch = useDebounce(search, 350);
  const canLoad = Boolean(
    params.partyProfileId &&
    params.slug &&
    params.branchId &&
    params.counterId &&
    params.transactionDate
  );
  const queryParams = useMemo(
    () => ({
      ...params,
      search: debouncedSearch.trim() || undefined,
      limit: params.limit ?? 100,
      offset: params.offset ?? 0,
    }),
    [debouncedSearch, params]
  );
  const {
    data: response,
    isLoading,
    isFetching,
    error,
  } = useOutstandingBills(type, queryParams, open && canLoad);
  const data = response?.data ?? EMPTY_OUTSTANDING_BILLS;

  const rows = useMemo(() => {
    const excluded = new Set(
      excludedTransactionIds.filter(id => !selectedTransactionIds.includes(id))
    );
    return data.filter(bill => !excluded.has(bill.id));
  }, [data, excludedTransactionIds, selectedTransactionIds]);

  const selectedTotal = selectedBills.reduce(
    (sum, bill) => sum + Number(bill.outstanding || 0),
    0
  );
  const columns = useMemo(() => buildColumns(), []);

  return (
    <SelectEntity<OutstandingBill>
      open={open}
      title={
        type === 'RECEIPT'
          ? OUTSTANDING_BILL_TEXT.titleReceipt
          : OUTSTANDING_BILL_TEXT.titlePayment
      }
      description={
        canLoad
          ? OUTSTANDING_BILL_TEXT.description(rows.length, itemTypeLabel)
          : OUTSTANDING_BILL_TEXT.missingContext
      }
      columns={columns}
      data={rows}
      loading={isLoading || (isFetching && data.length === 0)}
      selectable
      multiple
      searchValue={search}
      onSearch={setSearch}
      searchPlaceholder={OUTSTANDING_BILL_TEXT.searchPlaceholder}
      emptyMessage={
        error instanceof Error ? error.message : OUTSTANDING_BILL_TEXT.empty
      }
      selectedRowIds={selectedIds}
      selectedRows={selectedBills}
      onSelectedRowIdsChange={nextIds => {
        setSelectedIds(nextIds);
        setSelectedBills(current => {
          const byId = new Map([
            ...current.map(bill => [bill.id, bill] as const),
            ...rows.map(bill => [bill.id, bill] as const),
          ]);
          return nextIds
            .map(id => byId.get(id))
            .filter((bill): bill is OutstandingBill => Boolean(bill));
        });
      }}
      selectedSummary={
        selectedBills.length > 0 ? (
          <div className="rounded-sm border border-border-primary bg-surface-secondary p-3 text-sm text-text-primary">
            {OUTSTANDING_BILL_TEXT.selectedSummary(
              selectedBills.length,
              formatAmount(selectedTotal)
            )}
          </div>
        ) : null
      }
      getRowId={row => row.id}
      continueLabel={OUTSTANDING_BILL_TEXT.continueLabel}
      cancelLabel={OUTSTANDING_BILL_TEXT.cancelLabel}
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

export default SelectOutstandingBills;
