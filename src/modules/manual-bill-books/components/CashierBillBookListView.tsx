import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Table, type TableColumnDef } from '@/components/ui';
import { Modal } from '@/components/ui/modal/Modal';
import {
  manualBillBookApi,
  type IManualBookBookTracking,
  type IManualBookDispatchMeta,
} from '@/api';
import { useAuth } from '@/lib/AuthContext';
import { useOffsetPaginatedList } from '@/hooks';
import {
  formatBookRange,
  mvToBookNo,
  toDispatchMeta,
} from '../utils';
import toast from 'react-hot-toast';

export interface ICashierBookRow {
  key: string;
  dispatchNo: string;
  txnType: string;
  txnTypeLabel: string;
  assignedBookNoFrom: number;
  assignedBookNoTo: number;
  mvFrom: number;
  mvTo: number;
  pageCount: number;
  assignedByName: string;
  book: IManualBookDispatchMeta;
}

function mapSelectableBookToRow(item: IManualBookBookTracking): ICashierBookRow {
  const book = toDispatchMeta(item);
  const mvFrom = item.pageNoFrom;
  const mvTo = item.pageNoTo;

  return {
    key: `${item.manualBookId}-${mvFrom}-${mvTo}`,
    dispatchNo: item.no,
    txnType: item.transactionType,
    txnTypeLabel: item.transactionTypeLabel ?? item.transactionType,
    assignedBookNoFrom: mvToBookNo(mvFrom, book),
    assignedBookNoTo: mvToBookNo(mvTo, book),
    mvFrom,
    mvTo,
    pageCount: item.availablePageCount,
    assignedByName: item.assignedByName ?? '',
    book,
  };
}

async function resolvePageNosForReturn(
  row: ICashierBookRow,
  mvFrom: number,
  mvTo: number
): Promise<number[]> {
  const pageNos: number[] = [];

  for (
    let bookNo = row.assignedBookNoFrom;
    bookNo <= row.assignedBookNoTo;
    bookNo += 1
  ) {
    const pages = await manualBillBookApi.getPagesByBookNo(row.book.id, bookNo);
    pageNos.push(
      ...pages
        .filter(page => page.pageNo >= mvFrom && page.pageNo <= mvTo)
        .map(page => page.pageNo)
    );
  }

  return pageNos.sort((a, b) => a - b);
}

interface ReturnState {
  row: ICashierBookRow;
  pageNoFromStr: string;
  pageNoToStr: string;
  isSubmitting: boolean;
  error: string;
}

interface CashierBillBookListViewProps {
  /** If provided, overrides the default return-modal row click behaviour */
  onRowClick?: (row: ICashierBookRow) => void;
}

export const CashierBillBookListView = ({
  onRowClick,
}: CashierBillBookListViewProps = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const filters = useMemo(
    () => ({
      userId: user?.id,
    }),
    [user?.id]
  );

  const {
    rows: books,
    isLoading,
    isFetching,
    page,
    limit,
    total,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
  } = useOffsetPaginatedList({
    queryKey: ['cashier-manual-bill-books', user?.id],
    queryFn: params => manualBillBookApi.getSelectableBooks(params),
    filters,
    enabled: Boolean(user?.id),
  });

  const rows = useMemo(
    () => books.map(mapSelectableBookToRow),
    [books]
  );

  const [returnState, setReturnState] = useState<ReturnState | null>(null);

  const openReturnModal = (row: ICashierBookRow) => {
    if (onRowClick) {
      onRowClick(row);
      return;
    }

    setReturnState({
      row,
      pageNoFromStr: String(row.mvFrom),
      pageNoToStr: String(row.mvTo),
      isSubmitting: false,
      error: '',
    });
  };

  const closeReturnModal = () => setReturnState(null);

  const validateRange = (
    fromStr: string,
    toStr: string,
    row: ICashierBookRow
  ): string => {
    const from = parseInt(fromStr, 10);
    const to = parseInt(toStr, 10);
    if (isNaN(from) || isNaN(to)) return 'Please enter valid page numbers.';
    if (from < row.mvFrom)
      return `Page No From cannot be less than ${row.mvFrom}.`;
    if (to > row.mvTo) return `Page No To cannot be greater than ${row.mvTo}.`;
    if (from > to) return 'Page No From must be ≤ Page No To.';
    return '';
  };

  const handleConfirmReturn = async () => {
    if (!returnState) return;

    const { row, pageNoFromStr, pageNoToStr } = returnState;
    const err = validateRange(pageNoFromStr, pageNoToStr, row);
    if (err) {
      setReturnState(prev => (prev ? { ...prev, error: err } : null));
      return;
    }

    const mvFrom = parseInt(pageNoFromStr, 10);
    const mvTo = parseInt(pageNoToStr, 10);

    setReturnState(prev =>
      prev ? { ...prev, isSubmitting: true, error: '' } : null
    );

    try {
      const pageNos = await resolvePageNosForReturn(row, mvFrom, mvTo);

      if (pageNos.length === 0) {
        setReturnState(prev =>
          prev
            ? {
                ...prev,
                isSubmitting: false,
                error: 'No pages found for the selected range.',
              }
            : null
        );
        return;
      }

      await manualBillBookApi.returnPages(pageNos);
      toast.success('Pages returned to Branch Manager successfully.');
      closeReturnModal();
      await queryClient.invalidateQueries({
        queryKey: ['cashier-manual-bill-books'],
      });
    } catch (err: unknown) {
      setReturnState(prev =>
        prev
          ? {
              ...prev,
              isSubmitting: false,
              error:
                err instanceof Error ? err.message : 'Failed to return pages.',
            }
          : null
      );
    }
  };

  const columns = useMemo<TableColumnDef<ICashierBookRow>[]>(
    () => [
      {
        accessorKey: 'dispatchNo',
        header: 'Dispatch No',
        cell: ({ row }) => (
          <span className="font-semibold text-text-primary whitespace-nowrap">
            {row.original.dispatchNo}
          </span>
        ),
      },
      {
        accessorKey: 'txnType',
        header: 'Txn Type',
        cell: ({ row }) => (
          <span className="text-text-secondary whitespace-nowrap">
            {row.original.txnTypeLabel}
          </span>
        ),
      },
      {
        id: 'bookRange',
        header: 'Book Range',
        cell: ({ row }) => (
          <span className="font-semibold text-primary-700 whitespace-nowrap">
            {formatBookRange(
              row.original.assignedBookNoFrom,
              row.original.assignedBookNoTo
            )}
          </span>
        ),
      },
      {
        id: 'mvRange',
        header: 'MV Range',
        cell: ({ row }) => (
          <span className="font-semibold text-emerald-700 whitespace-nowrap font-mono">
            {row.original.mvFrom} – {row.original.mvTo}
          </span>
        ),
      },
      {
        accessorKey: 'pageCount',
        header: 'Pages',
        cell: ({ row }) => (
          <span className="text-text-secondary">{row.original.pageCount}</span>
        ),
      },
      {
        accessorKey: 'assignedByName',
        header: 'Assigned By',
        cell: ({ row }) => (
          <span className="text-xs text-slate-600 whitespace-nowrap">
            {row.original.assignedByName || '—'}
          </span>
        ),
      },
    ],
    []
  );

  const rowHint = onRowClick
    ? 'Click a row to map pages to a delivery person.'
    : 'Click a row to return pages to the Branch Manager.';

  return (
    <div className="space-y-6">
      <section className="rounded-sm border border-border-primary bg-surface-primary p-3 shadow-sm">
        <div className="overflow-x-auto border border-slate-200 rounded-md">
          <Table
            columns={columns}
            data={rows}
            enableSorting={false}
            enableFiltering={false}
            enablePagination
            manualPagination
            page={page}
            pageSize={limit}
            total={total}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            enableRowSelection={false}
            enableColumnVisibility={false}
            loading={isLoading}
            isFetching={isFetching}
            className="min-w-full text-xs"
            emptyMessage="No books assigned to you."
            onRowClick={openReturnModal}
          />
        </div>
        <p className="mt-2 text-xs text-slate-400">{rowHint}</p>
      </section>

      {returnState && (
        <Modal
          open
          onOpenChange={open => {
            if (!open) closeReturnModal();
          }}
          title="Return Pages to Branch Manager"
          size="md"
          footer={
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeReturnModal}
                disabled={returnState.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmReturn}
                disabled={returnState.isSubmitting}
              >
                {returnState.isSubmitting ? 'Returning...' : 'Confirm Return'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 border border-slate-200 rounded-md p-4">
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Dispatch No
                </span>
                <span className="font-semibold text-slate-800">
                  {returnState.row.dispatchNo}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Transaction Type
                </span>
                <span className="text-slate-700">
                  {returnState.row.txnTypeLabel}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Book Range
                </span>
                <span className="font-semibold text-primary-700">
                  {formatBookRange(
                    returnState.row.assignedBookNoFrom,
                    returnState.row.assignedBookNoTo
                  )}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">
                  MV Range
                </span>
                <span className="font-semibold text-emerald-700 font-mono">
                  {returnState.row.mvFrom} – {returnState.row.mvTo}
                </span>
              </div>
              <div className="col-span-2">
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Assigned By (Branch Manager)
                </span>
                <span className="font-semibold text-slate-800">
                  {returnState.row.assignedByName || '—'}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-600 mb-3">
                Enter the MV range to return{' '}
                <span className="text-slate-400 font-normal font-mono">
                  (within {returnState.row.mvFrom} – {returnState.row.mvTo})
                </span>
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    MV No From
                  </label>
                  <input
                    type="number"
                    min={returnState.row.mvFrom}
                    max={returnState.row.mvTo}
                    value={returnState.pageNoFromStr}
                    onChange={e =>
                      setReturnState(prev =>
                        prev
                          ? {
                              ...prev,
                              pageNoFromStr: e.target.value,
                              error: '',
                            }
                          : null
                      )
                    }
                    className="w-full rounded border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    MV No To
                  </label>
                  <input
                    type="number"
                    min={returnState.row.mvFrom}
                    max={returnState.row.mvTo}
                    value={returnState.pageNoToStr}
                    onChange={e =>
                      setReturnState(prev =>
                        prev
                          ? { ...prev, pageNoToStr: e.target.value, error: '' }
                          : null
                      )
                    }
                    className="w-full rounded border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>

              {returnState.error && (
                <p className="mt-2 text-xs font-medium text-rose-600">
                  {returnState.error}
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
