import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Table, type TableColumnDef } from '@/components/ui';
import { Modal } from '@/components/ui/modal/Modal';
import { manualBillBookApi, type IManualBookPageTracking } from '@/api';
import { useAuth } from '@/lib/AuthContext';
import toast from 'react-hot-toast';

export interface ICashierBookRow {
  key: string;
  dispatchNo: string;
  txnType: string;
  /** Assigned book-number range e.g. "121 - 150" */
  assignedBookRange: string;
  /** First assigned bookNo (for validation) */
  assignedBookNoFrom: number;
  /** Last assigned bookNo (for validation) */
  assignedBookNoTo: number;
  /** MV numbers e.g. "12101 - 15000" */
  mvRange: string;
  /** First MV number (for filtering page IDs) */
  mvFrom: number;
  /** Last MV number */
  mvTo: number;
  pageCount: number;
  /** Branch manager name who assigned these pages */
  assignedByName: string;
  /** All page objects in this segment — used to find IDs for returnPages */
  segmentPages: IManualBookPageTracking[];
  /** Book metadata */
  book: NonNullable<IManualBookPageTracking['manualBook']>;
}

function mvToBookNo(
  pageNo: number,
  book: NonNullable<IManualBookPageTracking['manualBook']>
): number {
  return book.bookNoFrom + Math.floor((pageNo - book.mvNoFrom) / book.vouchersPerBook);
}


function groupPagesIntoRows(pages: IManualBookPageTracking[]): ICashierBookRow[] {
  const byBook = new Map<string, IManualBookPageTracking[]>();
  for (const page of pages) {
    const list = byBook.get(page.manualBookId) ?? [];
    list.push(page);
    byBook.set(page.manualBookId, list);
  }

  const rows: ICashierBookRow[] = [];

  for (const [, bookPages] of byBook) {
    const sorted = [...bookPages].sort((a, b) => a.pageNo - b.pageNo);
    const book = sorted[0].manualBook;
    if (!book) continue;

    // Determine assigned-by name (consistent across pages in same assignment)
    const assignedByName = sorted[0].assignedByName ?? '';

    const emitRow = (segPages: IManualBookPageTracking[]) => {
      const mvFrom = segPages[0].pageNo;
      const mvTo = segPages[segPages.length - 1].pageNo;
      const startBookNo = mvToBookNo(mvFrom, book);
      const endBookNo = mvToBookNo(mvTo, book);
      rows.push({
        key: `${sorted[0].manualBookId}-${mvFrom}-${mvTo}`,
        dispatchNo: book.no,
        txnType: book.transactionType,
        assignedBookRange: startBookNo === endBookNo
          ? String(startBookNo)
          : `${startBookNo} - ${endBookNo}`,
        assignedBookNoFrom: startBookNo,
        assignedBookNoTo: endBookNo,
        mvRange: `${mvFrom} - ${mvTo}`,
        mvFrom,
        mvTo,
        pageCount: segPages.length,
        assignedByName,
        segmentPages: segPages,
        book,
      });
    };

    // Split into contiguous MV segments
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

interface ReassignState {
  row: ICashierBookRow;
  pageNoFromStr: string;
  pageNoToStr: string;
  isSubmitting: boolean;
  error: string;
}

interface CashierBillBookListViewProps {
  /** If provided, overrides the default "open reassign modal" row click behaviour */
  onRowClick?: (row: ICashierBookRow) => void;
}

export const CashierBillBookListView = ({ onRowClick }: CashierBillBookListViewProps = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: pages = [], isLoading, isFetching } = useQuery<IManualBookPageTracking[]>({
    queryKey: ['cashier-manual-bill-books', user?.id],
    queryFn: () => manualBillBookApi.getSelectablePages({ userId: user?.id }),
    enabled: !!user?.id,
  });

  const rows = useMemo(() => groupPagesIntoRows(pages), [pages]);

  const [reassign, setReassign] = useState<ReassignState | null>(null);

  const openModal = (row: ICashierBookRow) => {
    if (onRowClick) {
      onRowClick(row);
      return;
    }
    setReassign({
      row,
      pageNoFromStr: String(row.mvFrom),
      pageNoToStr: String(row.mvTo),
      isSubmitting: false,
      error: '',
    });
  };

  const closeModal = () => setReassign(null);

  const validateRange = (fromStr: string, toStr: string, row: ICashierBookRow): string => {
    const from = parseInt(fromStr, 10);
    const to = parseInt(toStr, 10);
    if (isNaN(from) || isNaN(to)) return 'Please enter valid page numbers.';
    if (from < row.mvFrom)
      return `Page No From cannot be less than ${row.mvFrom}.`;
    if (to > row.mvTo)
      return `Page No To cannot be greater than ${row.mvTo}.`;
    if (from > to) return 'Page No From must be ≤ Page No To.';
    return '';
  };

  const handleConfirmReassign = async () => {
    if (!reassign) return;
    const { row, pageNoFromStr, pageNoToStr } = reassign;
    const err = validateRange(pageNoFromStr, pageNoToStr, row);
    if (err) {
      setReassign(prev => prev ? { ...prev, error: err } : null);
      return;
    }

    const mvFrom = parseInt(pageNoFromStr, 10);
    const mvTo = parseInt(pageNoToStr, 10);

    // Find matching pages in segment by MV number range
    const pageNos = row.segmentPages
      .filter(p => p.pageNo >= mvFrom && p.pageNo <= mvTo)
      .map(p => p.pageNo);

    if (pageNos.length === 0) {
      setReassign(prev => prev ? { ...prev, error: 'No pages found for the selected range.' } : null);
      return;
    }

    setReassign(prev => prev ? { ...prev, isSubmitting: true, error: '' } : null);
    try {
      await manualBillBookApi.returnPages(pageNos);
      toast.success('Pages returned to Branch Manager successfully.');
      closeModal();
      await queryClient.invalidateQueries({ queryKey: ['cashier-manual-bill-books'] });
    } catch (err: unknown) {
      setReassign(prev =>
        prev ? { ...prev, isSubmitting: false, error: err instanceof Error ? err.message : 'Failed to return pages.' } : null
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
            {row.original.txnType}
          </span>
        ),
      },
      {
        accessorKey: 'assignedBookRange',
        header: 'Book Range (Assigned)',
        cell: ({ row }) => (
          <span className="font-semibold text-primary-700 whitespace-nowrap">
            {row.original.assignedBookRange}
          </span>
        ),
      },
      {
        accessorKey: 'mvRange',
        header: 'MV Range (Assigned)',
        cell: ({ row }) => (
          <span className="font-semibold text-emerald-700 whitespace-nowrap">
            {row.original.mvRange}
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
            emptyMessage="No pages assigned to you."
            onRowClick={openModal}
          />
        </div>
        <p className="mt-2 text-xs text-slate-400">Click a row to return pages to the Branch Manager.</p>
      </section>

      {/* Reassign Modal */}
      {reassign && (
        <Modal
          open
          onOpenChange={open => { if (!open) closeModal(); }}
          title="Return Pages to Branch Manager"
          size="md"
        >
          <div className="space-y-4">
            {/* Book details summary */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 border border-slate-200 rounded-md p-4">
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">Dispatch No</span>
                <span className="font-semibold text-slate-800">{reassign.row.dispatchNo}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">Transaction Type</span>
                <span className="text-slate-700">{reassign.row.txnType}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">Assigned Book Range</span>
                <span className="font-semibold text-primary-700">{reassign.row.assignedBookRange}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">MV Range (Assigned)</span>
                <span className="font-semibold text-emerald-700">{reassign.row.mvRange}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-slate-400 font-semibold mb-0.5">Assigned By (Branch Manager)</span>
                <span className="font-semibold text-slate-800">{reassign.row.assignedByName || '—'}</span>
              </div>
            </div>

            {/* Range inputs */}
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-3">
                Enter the MV range to return <span className="text-slate-400 font-normal">(within {reassign.row.mvRange})</span>
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    MV No From
                  </label>
                  <input
                    type="number"
                    min={reassign.row.mvFrom}
                    max={reassign.row.mvTo}
                    value={reassign.pageNoFromStr}
                    onChange={e =>
                      setReassign(prev => prev ? { ...prev, pageNoFromStr: e.target.value, error: '' } : null)
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
                    min={reassign.row.mvFrom}
                    max={reassign.row.mvTo}
                    value={reassign.pageNoToStr}
                    onChange={e =>
                      setReassign(prev => prev ? { ...prev, pageNoToStr: e.target.value, error: '' } : null)
                    }
                    className="w-full rounded border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>

              {reassign.error && (
                <p className="mt-2 text-xs font-medium text-rose-600">{reassign.error}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={closeModal}
                disabled={reassign.isSubmitting}
                className="cursor-pointer border border-slate-200 text-slate-600 hover:bg-slate-50 rounded px-4 py-2 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReassign}
                disabled={reassign.isSubmitting}
                className="cursor-pointer bg-rose-600 hover:bg-rose-500 text-white rounded px-4 py-2 text-xs font-semibold shadow transition disabled:opacity-50"
              >
                {reassign.isSubmitting ? 'Returning...' : 'Confirm Return'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
