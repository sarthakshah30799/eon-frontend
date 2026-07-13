import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Table, type TableColumnDef } from '@/components/ui';
import { Modal } from '@/components/ui/modal/Modal';
import { manualBillBookApi, type IDPAllocatedPageRow } from '@/api';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface UnmapFormState {
  row: IDPAllocatedPageRow;
  bookNoStr: string;
  mvFromStr: string;
  mvToStr: string;
  remarks: string;
  error: string;
}

interface ConfirmState {
  row: IDPAllocatedPageRow;
  mvFrom: number;
  mvTo: number;
  remarks: string;
  isSubmitting: boolean;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function mvToBookNo(
  pageNo: number,
  book: IDPAllocatedPageRow['book'],
): number {
  return book.bookNoFrom + Math.floor((pageNo - book.mvNoFrom) / book.vouchersPerBook);
}

function computeMVRangeForBook(
  bookNo: number,
  book: IDPAllocatedPageRow['book'],
): { mvFrom: number; mvTo: number } {
  const mvFrom = book.mvNoFrom + (bookNo - book.bookNoFrom) * book.vouchersPerBook;
  const mvTo = mvFrom + book.vouchersPerBook - 1;
  return { mvFrom, mvTo };
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export const CashierDPUnmapView = () => {
  const { activeBranchId } = useAuth();
  const queryClient = useQueryClient();

  const { data: dpRows = [], isLoading, isFetching } = useQuery<IDPAllocatedPageRow[]>({
    queryKey: ['dp-allocated-pages', activeBranchId],
    queryFn: () => manualBillBookApi.getDPAllocatedPages(),
    enabled: !!activeBranchId,
  });

  // ── State machine: list → form → confirm ──────────────────────────────
  const [formState, setFormState] = useState<UnmapFormState | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const openForm = (row: IDPAllocatedPageRow) => {
    const firstBookNo = row.bookNoFrom;
    const { mvFrom: calcFrom, mvTo: calcTo } = computeMVRangeForBook(firstBookNo, row.book);
    setFormState({
      row,
      bookNoStr: String(firstBookNo),
      mvFromStr: String(Math.max(row.mvFrom, calcFrom)),
      mvToStr: String(Math.min(row.mvTo, calcTo)),
      remarks: '',
      error: '',
    });
    setConfirmState(null);
  };

  const closeForm = () => {
    setFormState(null);
    setConfirmState(null);
  };

  const handleBookNoChange = (val: string) => {
    if (!formState) return;
    setFormState(prev => {
      if (!prev) return prev;
      const bookNo = parseInt(val, 10);
      if (!isNaN(bookNo)) {
        const { mvFrom: calcFrom, mvTo: calcTo } = computeMVRangeForBook(bookNo, prev.row.book);
        return {
          ...prev,
          bookNoStr: val,
          mvFromStr: String(Math.max(prev.row.mvFrom, calcFrom)),
          mvToStr: String(Math.min(prev.row.mvTo, calcTo)),
          error: '',
        };
      }
      return { ...prev, bookNoStr: val, error: '' };
    });
  };

  const handleReview = () => {
    if (!formState) return;
    const { row } = formState;
    const bookNo = parseInt(formState.bookNoStr, 10);
    const mvFrom = parseInt(formState.mvFromStr, 10);
    const mvTo = parseInt(formState.mvToStr, 10);

    if (isNaN(bookNo) || bookNo < row.bookNoFrom || bookNo > row.bookNoTo) {
      setFormState(prev => prev ? {
        ...prev,
        error: `Book No must be between ${row.bookNoFrom} and ${row.bookNoTo}.`,
      } : prev);
      return;
    }
    if (isNaN(mvFrom) || isNaN(mvTo) || mvFrom > mvTo) {
      setFormState(prev => prev ? { ...prev, error: 'MV No From must be ≤ MV No To.' } : prev);
      return;
    }
    if (mvFrom < row.mvFrom || mvTo > row.mvTo) {
      setFormState(prev => prev ? {
        ...prev,
        error: `MV range must be within ${row.mvFrom} – ${row.mvTo}.`,
      } : prev);
      return;
    }

    // Validate the range belongs to the specified book
    const expectedBookNoFrom = mvToBookNo(mvFrom, row.book);
    const expectedBookNoTo = mvToBookNo(mvTo, row.book);
    if (expectedBookNoFrom !== bookNo || expectedBookNoTo !== bookNo) {
      setFormState(prev => prev ? {
        ...prev,
        error: 'The entered MV range spans multiple books or does not match the selected Book No.',
      } : prev);
      return;
    }

    setConfirmState({
      row,
      mvFrom,
      mvTo,
      remarks: formState.remarks,
      isSubmitting: false,
    });
  };

  const handleConfirm = async () => {
    if (!confirmState) return;
    setConfirmState(prev => prev ? { ...prev, isSubmitting: true } : prev);
    try {
      await manualBillBookApi.unmapFromDP({
        dpUserId: confirmState.row.dpUserId,
        manualBookId: confirmState.row.manualBookId,
        mvFrom: confirmState.mvFrom,
        mvTo: confirmState.mvTo,
        remarks: confirmState.remarks || undefined,
      });
      toast.success('Pages successfully unmapped from delivery person.');
      closeForm();
      await queryClient.invalidateQueries({ queryKey: ['dp-allocated-pages'] });
      await queryClient.invalidateQueries({ queryKey: ['cashier-manual-bill-books'] });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Unmap failed.');
      setConfirmState(prev => prev ? { ...prev, isSubmitting: false } : prev);
    }
  };

  /* ─── Table columns ─────────────────────────────────────────────────── */

  const columns = useMemo<TableColumnDef<IDPAllocatedPageRow>[]>(() => [
    {
      accessorKey: 'dpName',
      header: 'Delivery Person',
      cell: ({ row }) => (
        <span className="font-semibold text-text-primary whitespace-nowrap">
          {row.original.dpName}
        </span>
      ),
    },
    {
      accessorKey: 'dispatchNo',
      header: 'Dispatch No',
      cell: ({ row }) => (
        <span className="text-text-secondary whitespace-nowrap">{row.original.dispatchNo}</span>
      ),
    },
    {
      accessorKey: 'txnType',
      header: 'Txn Type',
      cell: ({ row }) => (
        <span className="text-text-secondary whitespace-nowrap">{row.original.txnType}</span>
      ),
    },
    {
      id: 'bookRange',
      header: 'Book Range',
      cell: ({ row }) => {
        const r = row.original;
        const range = r.bookNoFrom === r.bookNoTo
          ? String(r.bookNoFrom)
          : `${r.bookNoFrom} – ${r.bookNoTo}`;
        return (
          <span className="font-semibold text-primary-700 whitespace-nowrap">{range}</span>
        );
      },
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
      id: 'assignedBy',
      header: 'Assigned By',
      cell: ({ row }) => (
        <span className="text-xs text-slate-600 whitespace-nowrap">
          {row.original.assignedByName ?? '—'}
        </span>
      ),
    },
  ], []);

  /* ─── List view ──────────────────────────────────────────────────────── */

  if (!formState && !confirmState) {
    return (
      <div className="space-y-6">
        <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
          <div className="overflow-x-auto border border-slate-200 rounded-md">
            <Table
              columns={columns}
              data={dpRows}
              enableSorting={false}
              enableFiltering={false}
              enablePagination={false}
              enableRowSelection={false}
              enableColumnVisibility={false}
              loading={isLoading || isFetching}
              className="min-w-full text-xs"
              emptyMessage="No pages are currently assigned to delivery persons."
              onRowClick={openForm}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Click a row to retrieve pages from that delivery person.
          </p>
        </section>
      </div>
    );
  }

  /* ─── Form view ──────────────────────────────────────────────────────── */

  if (formState && !confirmState) {
    const { row } = formState;
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={closeForm}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 w-fit"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Back to list
        </button>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            Retrieve Pages from Delivery Person
          </h4>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 border border-slate-200 rounded-md p-4">
            <div>
              <span className="block text-slate-400 font-semibold mb-0.5">Assigned To (DP)</span>
              <span className="font-semibold text-rose-700">{row.dpName}</span>
            </div>
            <div>
              <span className="block text-slate-400 font-semibold mb-0.5">Assigned By</span>
              <span className="font-semibold text-slate-800">{row.assignedByName ?? '—'}</span>
            </div>
            <div>
              <span className="block text-slate-400 font-semibold mb-0.5">Dispatch No</span>
              <span className="text-slate-700">{row.dispatchNo}</span>
            </div>
            <div>
              <span className="block text-slate-400 font-semibold mb-0.5">Transaction Type</span>
              <span className="text-slate-700">{row.txnType}</span>
            </div>
            <div>
              <span className="block text-slate-400 font-semibold mb-0.5">Book Range (Assigned)</span>
              <span className="font-semibold text-primary-700">
                {row.bookNoFrom === row.bookNoTo ? row.bookNoFrom : `${row.bookNoFrom} – ${row.bookNoTo}`}
              </span>
            </div>
            <div>
              <span className="block text-slate-400 font-semibold mb-0.5">MV Range (Assigned)</span>
              <span className="font-semibold text-emerald-700 font-mono">{row.mvFrom} – {row.mvTo}</span>
            </div>
            <div className="col-span-2">
              <span className="block text-slate-400 font-semibold mb-0.5">Pages will be returned to</span>
              <span className="font-semibold text-sky-700">
                {row.returnToUserName ?? 'Branch Manager pool (records released)'}
              </span>
            </div>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Book No *
                <span className="ml-1 text-slate-400 font-normal">
                  ({row.bookNoFrom}–{row.bookNoTo})
                </span>
              </label>
              <input
                type="number"
                min={row.bookNoFrom}
                max={row.bookNoTo}
                value={formState.bookNoStr}
                onChange={e => handleBookNoChange(e.target.value)}
                placeholder={String(row.bookNoFrom)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs h-[38px] focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                MV No From *
                <span className="ml-1 text-slate-400 font-normal">(min: {row.mvFrom})</span>
              </label>
              <input
                type="number"
                min={row.mvFrom}
                max={row.mvTo}
                value={formState.mvFromStr}
                onChange={e =>
                  setFormState(prev => prev ? { ...prev, mvFromStr: e.target.value, error: '' } : prev)
                }
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs h-[38px] focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                MV No To *
                <span className="ml-1 text-slate-400 font-normal">(max: {row.mvTo})</span>
              </label>
              <input
                type="number"
                min={row.mvFrom}
                max={row.mvTo}
                value={formState.mvToStr}
                onChange={e =>
                  setFormState(prev => prev ? { ...prev, mvToStr: e.target.value, error: '' } : prev)
                }
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs h-[38px] focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Remarks (optional)</label>
            <textarea
              rows={2}
              value={formState.remarks}
              onChange={e =>
                setFormState(prev => prev ? { ...prev, remarks: e.target.value } : prev)
              }
              placeholder="Reason for retrieval..."
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none"
            />
          </div>

          {formState.error && (
            <p className="text-xs font-medium text-rose-600">{formState.error}</p>
          )}

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReview}
              className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-sky-600 hover:bg-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition"
            >
              Review &amp; Confirm
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Confirmation modal ─────────────────────────────────────────────── */

  if (confirmState) {
    const { row } = confirmState;

    return (
      <>
        {/* Keep form visible behind modal */}
        <div className="space-y-6 opacity-30 pointer-events-none">
          <div className="h-40 bg-slate-100 rounded-xl border border-slate-200" />
        </div>

        <Modal
          open
          onOpenChange={open => { if (!open && !confirmState.isSubmitting) setConfirmState(null); }}
          title="Confirm Unmap from Delivery Person"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-md bg-amber-50 border border-amber-200 px-4 py-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                This action will retrieve the selected pages from the delivery person and restore them to the original owner.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 border border-slate-200 rounded-md p-4">
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">Assigned By</span>
                <span className="font-semibold text-slate-800">{row.assignedByName ?? '—'}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">Assigned To (DP)</span>
                <span className="font-semibold text-rose-700">{row.dpName}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">Bill Book No</span>
                <span className="font-semibold text-primary-700">
                  {row.bookNoFrom === row.bookNoTo
                    ? String(row.bookNoFrom)
                    : `${row.bookNoFrom} – ${row.bookNoTo}`}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">Page Range (MV)</span>
                <span className="font-semibold text-emerald-700 font-mono">
                  {confirmState.mvFrom} – {confirmState.mvTo}
                </span>
              </div>
              <div className="col-span-2">
                <span className="block text-slate-400 font-semibold mb-0.5">Action</span>
                {row.returnToUserName ? (
                  <span className="text-sky-700 font-semibold">
                    Pages will be returned to <strong>{row.returnToUserName}</strong>
                  </span>
                ) : (
                  <span className="text-amber-700 font-semibold">
                    Pages will be released — Branch Manager can reassign them
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmState(null)}
                disabled={confirmState.isSubmitting}
                className="cursor-pointer border border-slate-200 text-slate-600 hover:bg-slate-50 rounded px-4 py-2 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={confirmState.isSubmitting}
                className="cursor-pointer bg-rose-600 hover:bg-rose-500 text-white rounded px-4 py-2 text-xs font-semibold shadow transition disabled:opacity-50"
              >
                {confirmState.isSubmitting ? 'Processing...' : 'Confirm Unmap'}
              </button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  return null;
};
