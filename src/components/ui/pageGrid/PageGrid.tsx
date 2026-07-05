import { useState } from 'react';
import { Button, Modal } from '@/components/ui';

export interface IPageItem {
  pageNo: number;
  status: 'ALLOCATED' | 'USED' | 'VOID';
  remarks?: string;
}

interface PageGridProps {
  title?: string;
  pages: IPageItem[];
  isLoading?: boolean;
  onUpdateStatus: (pageNos: number[], status: 'VOID', remarks?: string) => Promise<void>;
  onReturnPages: (pageNos: number[]) => Promise<void>;
}

export const PageGrid = ({
  title = 'Book Pages Tracking',
  pages,
  isLoading = false,
  onUpdateStatus,
  onReturnPages,
}: PageGridProps) => {
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [modalState, setModalState] = useState<{
    open: boolean;
    type: 'status' | 'return' | 'detail';
    targetStatus?: 'VOID';
    pages: number[];
  }>({
    open: false,
    type: 'detail',
    pages: [],
  });

  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Statistics
  const totalCount = pages.length;
  const usedCount = pages.filter(p => p.status === 'USED').length;
  const voidCount = pages.filter(p => p.status === 'VOID').length;
  const allocatedCount = pages.filter(p => p.status === 'ALLOCATED').length;

  const handlePageClick = (page: IPageItem) => {
    if (isMultiSelect) {
      if (page.status !== 'ALLOCATED') return; // Only allow multi-selecting ALLOCATED pages for actions
      setSelectedPages(prev =>
        prev.includes(page.pageNo)
          ? prev.filter(no => no !== page.pageNo)
          : [...prev, page.pageNo]
      );
    } else {
      // Single click opens details / single action modal
      if (page.status === 'ALLOCATED') {
        setModalState({
          open: true,
          type: 'status',
          targetStatus: 'VOID',
          pages: [page.pageNo],
        });
      } else {
        setModalState({
          open: true,
          type: 'detail',
          pages: [page.pageNo],
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'USED':
        return 'bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-200';
      case 'VOID':
        return 'bg-rose-500 text-white border-rose-600 shadow-sm shadow-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200';
    }
  };

  const handleToggleMultiSelect = () => {
    setIsMultiSelect(!isMultiSelect);
    setSelectedPages([]);
  };

  const handleBatchStatusChange = (status: 'VOID') => {
    if (selectedPages.length === 0) return;
    setModalState({
      open: true,
      type: 'status',
      targetStatus: status,
      pages: selectedPages,
    });
  };

  const handleBatchReturn = () => {
    if (selectedPages.length === 0) return;
    setModalState({
      open: true,
      type: 'return',
      pages: selectedPages,
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (modalState.type === 'status') {
        const target = modalState.targetStatus || 'VOID';
        await onUpdateStatus(modalState.pages, target, remarks);
      } else if (modalState.type === 'return') {
        await onReturnPages(modalState.pages);
      }
      // Reset states
      setSelectedPages([]);
      setIsMultiSelect(false);
      setRemarks('');
      setModalState({ open: false, type: 'detail', pages: [] });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const detailPage = pages.find(p => p.pageNo === modalState.pages[0]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-500">
            Click leaves to void or return them.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={isMultiSelect ? 'default' : 'secondary'}
            onClick={handleToggleMultiSelect}
            size="sm"
          >
            {isMultiSelect ? 'Cancel Multi-Select' : 'Multi-Select'}
          </Button>

          {isMultiSelect && selectedPages.length > 0 && (
            <>
              <Button
                variant="destructive"
                onClick={() => handleBatchStatusChange('VOID')}
                size="sm"
              >
                Void Selected ({selectedPages.length})
              </Button>
              <Button
                variant="secondary"
                onClick={handleBatchReturn}
                size="sm"
              >
                Return Selected ({selectedPages.length})
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-md text-center">
          <span className="block text-xs font-semibold text-slate-500">Total</span>
          <span className="text-xl font-bold text-slate-800">{totalCount}</span>
        </div>
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-md text-center">
          <span className="block text-xs font-semibold text-emerald-600">Used</span>
          <span className="text-xl font-bold text-emerald-800">{usedCount}</span>
        </div>
        <div className="p-3 bg-rose-50 border border-rose-100 rounded-md text-center">
          <span className="block text-xs font-semibold text-rose-600">Void</span>
          <span className="text-xl font-bold text-rose-800">{voidCount}</span>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-md text-center">
          <span className="block text-xs font-semibold text-slate-500">Allocated</span>
          <span className="text-xl font-bold text-slate-800">{allocatedCount}</span>
        </div>
      </div>

      {/* Pages Grid */}
      {isLoading ? (
        <div className="py-12 flex justify-center items-center text-slate-400">
          Loading page leaves...
        </div>
      ) : pages.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          No leaves found for this assignment.
        </div>
      ) : (
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-96 overflow-y-auto pr-1">
          {pages.map(page => {
            const isSelected = selectedPages.includes(page.pageNo);
            const isSelectable = page.status === 'ALLOCATED';
            return (
              <button
                key={page.pageNo}
                onClick={() => handlePageClick(page)}
                disabled={isMultiSelect && !isSelectable}
                className={`py-2 px-1 text-xs font-semibold text-center border rounded-md transition-all cursor-pointer select-none ${getStatusColor(
                  page.status
                )} ${
                  isSelected ? 'ring-2 ring-blue-500 scale-95 border-blue-600' : ''
                } ${
                  isMultiSelect && !isSelectable ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                {page.pageNo}
              </button>
            );
          })}
        </div>
      )}

      {/* Action / Detail Modal */}
      <Modal
        open={modalState.open}
        onOpenChange={(open) => !open && setModalState(prev => ({ ...prev, open: false }))}
        title={
          modalState.type === 'detail'
            ? `Page ${modalState.pages[0]} Details`
            : modalState.type === 'return'
            ? 'Return Pages to Manager'
            : 'Update Page Status'
        }
        size="md"
      >
        <div className="py-2 text-sm text-slate-600">
          {modalState.type === 'detail' && detailPage && (
            <div className="space-y-3">
              <div>
                <span className="block font-semibold text-slate-500 text-xs">VOUCHER / LEAF NUMBER</span>
                <span className="text-lg font-bold text-slate-800">{detailPage.pageNo}</span>
              </div>
              <div>
                <span className="block font-semibold text-slate-500 text-xs">STATUS</span>
                <span className="inline-block px-2.5 py-0.5 mt-1 rounded text-xs font-semibold bg-slate-100 text-slate-800">
                  {detailPage.status}
                </span>
              </div>
              {detailPage.remarks && (
                <div>
                  <span className="block font-semibold text-slate-500 text-xs">REMARKS</span>
                  <span className="block mt-1 text-slate-800 p-2.5 bg-slate-50 rounded border border-slate-100">
                    {detailPage.remarks}
                  </span>
                </div>
              )}
              <div className="pt-4 flex justify-end">
                <Button variant="secondary" onClick={() => setModalState(prev => ({ ...prev, open: false }))}>
                  Close
                </Button>
              </div>
            </div>
          )}

          {modalState.type === 'status' && (
            <div className="space-y-4">
              <p>
                You are updating the status of **{modalState.pages.length}** page(s):
                <span className="block mt-1 p-2 bg-slate-50 border border-slate-100 rounded text-slate-700 font-semibold max-h-20 overflow-y-auto">
                  {modalState.pages.join(', ')}
                </span>
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  NEW STATUS
                </label>
                <div className="p-2 border border-slate-200 bg-slate-50 rounded text-slate-800 font-semibold">
                  VOID (Cancelled / Spoiled)
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  REMARKS * (Required)
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter reason..."
                  className="w-full p-2.5 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setModalState(prev => ({ ...prev, open: false }))}>
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !remarks.trim()}
                >
                  {isSubmitting ? 'Updating...' : 'Update Status'}
                </Button>
              </div>
            </div>
          )}

          {modalState.type === 'return' && (
            <div className="space-y-4">
              <p>
                Are you sure you want to return **{modalState.pages.length}** unused page(s) to the manager?
                <span className="block mt-1 p-2 bg-slate-50 border border-slate-100 rounded text-slate-700 font-semibold max-h-20 overflow-y-auto">
                  {modalState.pages.join(', ')}
                </span>
              </p>
              <p className="text-xs text-rose-600 font-semibold">
                Warning: This will delete these page records from the user's assignment so they can be re-allocated in the future.
              </p>

              <div className="pt-4 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setModalState(prev => ({ ...prev, open: false }))}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Returning...' : 'Return Pages'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
