import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Table, type TableColumnDef } from '@/components/ui';
import { Modal } from '@/components/ui/modal/Modal';
import { chequebookApi, type IChequeBookPageTracking } from '@/api';
import { useAuth } from '@/lib/AuthContext';
import toast from 'react-hot-toast';

export interface ICashierChequeBookRow {
  key: string;
  dispatchNo: string;
  bankAccountCodeLabel: string | null;
  bookNo: number;
  chequeRange: string;
  mvFrom: number;
  mvTo: number;
  pageCount: number;
  assignedBy?: string | null;
  assignedByName?: string | null;
  segmentPages: IChequeBookPageTracking[];
  book: NonNullable<IChequeBookPageTracking['checkBook']>;
}

function mvToBookNo(
  pageNo: number,
  book: NonNullable<IChequeBookPageTracking['checkBook']>
): number {
  return book.bookNoFrom + Math.floor((pageNo - book.mvNoFrom) / book.vouchersPerBook);
}

function groupPagesIntoRows(pages: IChequeBookPageTracking[]): ICashierChequeBookRow[] {
  const byBook = new Map<string, IChequeBookPageTracking[]>();
  for (const page of pages) {
    const list = byBook.get(page.checkBookId) ?? [];
    list.push(page);
    byBook.set(page.checkBookId, list);
  }

  const rows: ICashierChequeBookRow[] = [];

  for (const [, bookPages] of byBook) {
    const sorted = [...bookPages].sort((a, b) => a.pageNo - b.pageNo);
    const book = sorted[0].checkBook;
    if (!book) continue;

    const assignedByName = sorted[0].assignedByName ?? null;
    const assignedBy = sorted[0].assignedBy ?? null;

    const emitRow = (segPages: IChequeBookPageTracking[]) => {
      const mvFrom = segPages[0].pageNo;
      const mvTo = segPages[segPages.length - 1].pageNo;
      const bookNo = mvToBookNo(mvFrom, book);
      rows.push({
        key: `${sorted[0].checkBookId}-${mvFrom}-${mvTo}`,
        dispatchNo: book.no,
        bankAccountCodeLabel: book.bankAccountCodeLabel ?? book.bankAccountCode,
        bookNo,
        chequeRange: `${mvFrom} - ${mvTo}`,
        mvFrom,
        mvTo,
        pageCount: segPages.length,
        assignedBy,
        assignedByName,
        segmentPages: segPages,
        book,
      });
    };

    // Split into contiguous page segments
    let segStart = 0;
    for (let i = 1; i <= sorted.length; i++) {
      if (i === sorted.length || sorted[i].pageNo !== sorted[i - 1].pageNo + 1) {
        emitRow(sorted.slice(segStart, i));
        segStart = i;
      }
    }
  }

  return rows;
}

interface ReturnState {
  row: ICashierChequeBookRow;
  pageNoFromStr: string;
  pageNoToStr: string;
  isSubmitting: boolean;
  error: string;
}

export const CashierChequeBookListView = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: pages = [], isLoading, isFetching } = useQuery<IChequeBookPageTracking[]>({
    queryKey: ['cashier-chequebooks', user?.id],
    queryFn: () => chequebookApi.getSelectablePages({ userId: user?.id }),
    enabled: !!user?.id,
  });

  const rows = useMemo(() => groupPagesIntoRows(pages), [pages]);

  const [returnState, setReturnState] = useState<ReturnState | null>(null);

  const openModal = (row: ICashierChequeBookRow) => {
    setReturnState({
      row,
      pageNoFromStr: String(row.mvFrom),
      pageNoToStr: String(row.mvTo),
      isSubmitting: false,
      error: '',
    });
  };

  const closeModal = () => setReturnState(null);

  const validateRange = (fromStr: string, toStr: string, row: ICashierChequeBookRow): string => {
    const from = parseInt(fromStr, 10);
    const to = parseInt(toStr, 10);
    if (isNaN(from) || isNaN(to)) return 'Please enter valid cheque numbers.';
    if (from < row.mvFrom) return `Cheque No From cannot be less than ${row.mvFrom}.`;
    if (to > row.mvTo) return `Cheque No To cannot be greater than ${row.mvTo}.`;
    if (from > to) return 'Cheque No From must be ≤ Cheque No To.';
    return '';
  };

  const handleConfirmReturn = async () => {
    if (!returnState) return;
    const { row, pageNoFromStr, pageNoToStr } = returnState;
    const err = validateRange(pageNoFromStr, pageNoToStr, row);
    if (err) {
      setReturnState(prev => prev ? { ...prev, error: err } : null);
      return;
    }

    const mvFrom = parseInt(pageNoFromStr, 10);
    const mvTo = parseInt(pageNoToStr, 10);

    const pageNos = row.segmentPages
      .filter(p => p.pageNo >= mvFrom && p.pageNo <= mvTo)
      .map(p => p.pageNo);

    if (pageNos.length === 0) {
      setReturnState(prev => prev ? { ...prev, error: 'No pages found for the selected range.' } : null);
      return;
    }

    setReturnState(prev => prev ? { ...prev, isSubmitting: true, error: '' } : null);
    try {
      await chequebookApi.returnPages(pageNos);
      toast.success('Pages returned to Branch Manager successfully.');
      closeModal();
      await queryClient.invalidateQueries({ queryKey: ['cashier-chequebooks'] });
    } catch (err: unknown) {
      setReturnState(prev =>
        prev
          ? { ...prev, isSubmitting: false, error: err instanceof Error ? err.message : 'Failed to return pages.' }
          : null
      );
    }
  };

  const columns = useMemo<TableColumnDef<ICashierChequeBookRow>[]>(
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
        accessorKey: 'bankAccountCodeLabel',
        header: 'Bank Account',
        cell: ({ row }) => (
          <span className="text-text-secondary whitespace-nowrap">
            {row.original.bankAccountCodeLabel || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'bookNo',
        header: 'Book No',
        cell: ({ row }) => (
          <span className="font-semibold text-primary-700 whitespace-nowrap">
            {row.original.bookNo}
          </span>
        ),
      },
      {
        accessorKey: 'chequeRange',
        header: 'Cheque Range',
        cell: ({ row }) => (
          <span className="font-semibold text-emerald-700 whitespace-nowrap">
            {row.original.chequeRange}
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
          <span className="text-text-secondary whitespace-nowrap">
            {row.original.assignedByName || '—'}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <div className="overflow-x-auto border border-slate-200 rounded-md">
          <Table
            columns={columns}
            data={rows}
            enableSorting={false}
            enableFiltering={false}
            enablePagination={false}
            enableRowSelection={false}
            enableColumnVisibility={false}
            loading={isLoading || isFetching}
            className="min-w-full text-xs"
            emptyMessage="No cheque pages assigned to you."
            onRowClick={openModal}
          />
        </div>
        <p className="mt-2 text-xs text-slate-400">Click a row to return pages to the Branch Manager.</p>
      </section>

      {/* Return Modal */}
      {returnState && (
        <Modal
          open
          onOpenChange={open => { if (!open) closeModal(); }}
          title="Return Cheque Pages to Branch Manager"
          size="md"
        >
          <div className="space-y-4">
            {/* Book details summary */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 border border-slate-200 rounded-md p-4">
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">Dispatch No</span>
                <span className="font-semibold text-slate-800">{returnState.row.dispatchNo}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">Bank Account</span>
                <span className="text-slate-700">{returnState.row.bankAccountCodeLabel || '—'}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">Book No</span>
                <span className="font-semibold text-primary-700">{returnState.row.bookNo}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">Cheque Range (Assigned)</span>
                <span className="font-semibold text-emerald-700">{returnState.row.chequeRange}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-slate-400 font-semibold mb-0.5">Assigned By (Branch Manager)</span>
                <span className="font-semibold text-slate-800">{returnState.row.assignedByName || '—'}</span>
              </div>
            </div>

            {/* Range inputs */}
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-3">
                Enter the cheque range to return{' '}
                <span className="text-slate-400 font-normal">(within {returnState.row.chequeRange})</span>
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Cheque No From</label>
                  <input
                    type="number"
                    min={returnState.row.mvFrom}
                    max={returnState.row.mvTo}
                    value={returnState.pageNoFromStr}
                    onChange={e =>
                      setReturnState(prev => prev ? { ...prev, pageNoFromStr: e.target.value, error: '' } : null)
                    }
                    className="w-full rounded border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Cheque No To</label>
                  <input
                    type="number"
                    min={returnState.row.mvFrom}
                    max={returnState.row.mvTo}
                    value={returnState.pageNoToStr}
                    onChange={e =>
                      setReturnState(prev => prev ? { ...prev, pageNoToStr: e.target.value, error: '' } : null)
                    }
                    className="w-full rounded border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>

              {returnState.error && (
                <p className="mt-2 text-xs font-medium text-rose-600">{returnState.error}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={closeModal}
                disabled={returnState.isSubmitting}
                className="cursor-pointer border border-slate-200 text-slate-600 hover:bg-slate-50 rounded px-4 py-2 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReturn}
                disabled={returnState.isSubmitting}
                className="cursor-pointer bg-rose-600 hover:bg-rose-500 text-white rounded px-4 py-2 text-xs font-semibold shadow transition disabled:opacity-50"
              >
                {returnState.isSubmitting ? 'Returning...' : 'Confirm Return'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
