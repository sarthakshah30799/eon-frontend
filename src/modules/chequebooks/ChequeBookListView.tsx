import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePermission } from '@/hooks/usePermission';
import {
  chequebookApi,
  type IChequeBook,
  type IChequeBookAllocation,
  type IChequeBookPageTracking,
} from '@/api';
import { Modal } from '@/components/ui/modal/Modal';
import toast from 'react-hot-toast';
import { Loader } from '@/components/ui/loader';
import {
  AsyncSelect,
  Button,
  Input,
  PageGrid,
  type AsyncSelectOption,
  type AsyncSelectResponse,
} from '@/components/ui';
import { useListChequeBooks } from './hooks';
import { useListBranchProfiles } from '@/modules/branchProfile/hooks';
import { ChequeBookTable } from './components';
import {
  ChequeBookStatusEnum,
  type ChequeBookStatus,
} from './types';

const resolveAssignedToLabel = (assignedTo: IChequeBook['assignedTo']) => {
  if (assignedTo && typeof assignedTo === 'object') {
    return assignedTo.name || assignedTo.id;
  }

  return assignedTo || 'N/A';
};

export const ChequeBookListView = () => {
  const navigate = useNavigate();
  const { canAdd } = usePermission('/checkbooks');
  // Filter states
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<ChequeBookStatus | ''>('');

  // Review modal states
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'Approved' | 'Rejected'>(
    'Approved'
  );
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBook, setSelectedBook] = useState<IChequeBook | null>(null);

  const reviewStatusOptions = useMemo<AsyncSelectOption[]>(
    () => [
      { value: 'Approved', label: 'APPROVE' },
      { value: 'Rejected', label: 'REJECT' },
    ],
    []
  );

  const selectedReviewStatusOption = useMemo<AsyncSelectOption | null>(
    () => reviewStatusOptions.find(option => option.value === approvalStatus) ?? null,
    [approvalStatus, reviewStatusOptions]
  );

  const loadReviewStatusOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const normalizedInput = inputValue.trim().toLowerCase();
      const filteredOptions = normalizedInput
        ? reviewStatusOptions.filter(option =>
          option.label.toLowerCase().includes(normalizedInput)
        )
        : reviewStatusOptions;

      return {
        options: filteredOptions,
      };
    },
    [reviewStatusOptions]
  );

  const { data: branches = [] } = useListBranchProfiles({
    activeOnly: true,
  });

  const branchOptions = useMemo<AsyncSelectOption[]>(
    () =>
      branches.map(branch => ({
        value: branch.id,
        label: `${branch.code} - ${branch.name}`,
      })),
    [branches]
  );

  const selectedBranchOption = useMemo<AsyncSelectOption | null>(
    () => branchOptions.find(option => option.value === branchFilter) ?? null,
    [branchFilter, branchOptions]
  );

  const loadBranchOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const normalizedInput = inputValue.trim().toLowerCase();
      const filteredOptions = normalizedInput
        ? branchOptions.filter(option =>
          option.label.toLowerCase().includes(normalizedInput)
        )
        : branchOptions;

      return {
        options: filteredOptions,
      };
    },
    [branchOptions]
  );

  const statusOptions = useMemo<AsyncSelectOption[]>(
    () => [
      {
        value: ChequeBookStatusEnum.PENDING,
        label: ChequeBookStatusEnum.PENDING,
      },
      {
        value: ChequeBookStatusEnum.APPROVED,
        label: ChequeBookStatusEnum.APPROVED,
      },
      {
        value: ChequeBookStatusEnum.REJECTED,
        label: ChequeBookStatusEnum.REJECTED,
      },
    ],
    []
  );

  const selectedStatusOption = useMemo<AsyncSelectOption | null>(
    () => statusOptions.find(option => option.value === statusFilter) ?? null,
    [statusFilter, statusOptions]
  );

  const loadStatusOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const normalizedInput = inputValue.trim().toLowerCase();
      const filteredOptions = normalizedInput
        ? statusOptions.filter(option =>
          option.label.toLowerCase().includes(normalizedInput)
        )
        : statusOptions;

      return {
        options: filteredOptions,
      };
    },
    [statusOptions]
  );

  const {
    data: books = [],
    isLoading,
    isFetching,
    error,
    refetch: refetchBooks,
  } = useListChequeBooks({
    branchId: branchFilter || undefined,
    status: statusFilter || undefined,
  });

  const [searchParams] = useSearchParams();
  const reviewId = searchParams.get('reviewId');

  useEffect(() => {
    if (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to load chequebook records.';
      toast.error(message);
    }
  }, [error]);

  useEffect(() => {
    if (reviewId && books.length > 0) {
      const book = books.find(b => b.id === reviewId);
      if (book) {
        setSelectedBook(book);
        setIsReviewOpen(true);
      }
    }
  }, [reviewId, books]);


  // Page Tracking allocation list & cashier list states
  const [allocations, setAllocations] = useState<IChequeBookAllocation[]>([]);
  const [isLoadingAllocations, setIsLoadingAllocations] = useState(false);
  const [cashiers, setCashiers] = useState<Array<{ id: string; name: string }>>([]);

  // Sub-modal for PageGrid states
  const [selectedAllocation, setSelectedAllocation] = useState<IChequeBookAllocation | null>(null);
  const [isPagesModalOpen, setIsPagesModalOpen] = useState(false);
  const [pages, setPages] = useState<IChequeBookPageTracking[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);

  useEffect(() => {
    const fetchAllocations = async () => {
      if (!selectedBook || selectedBook.status === 'Pending') {
        setAllocations([]);
        return;
      }
      try {
        setIsLoadingAllocations(true);
        const data = await chequebookApi.getAllocations([selectedBook.id]);
        setAllocations(data);
      } catch (err: unknown) {
        console.error('Failed to load allocations:', err);
      } finally {
        setIsLoadingAllocations(false);
      }
    };
    fetchAllocations();
  }, [selectedBook]);

  useEffect(() => {
    const fetchCashiers = async () => {
      if (!selectedBook) return;
      try {
        const data = await chequebookApi.getAuthorizedUsers(selectedBook.branchId);
        setCashiers(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCashiers();
  }, [selectedBook]);

  const handleViewPages = async (alloc: IChequeBookAllocation) => {
    setSelectedAllocation(alloc);
    setIsPagesModalOpen(true);
    try {
      setIsLoadingPages(true);
      const data = await chequebookApi.getPagesByBookNo(alloc.checkBookId, alloc.bookNo);
      setPages(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load page tracking records.');
    } finally {
      setIsLoadingPages(false);
    }
  };

  const handleUpdatePageStatus = async (pageNos: number[], status: 'VOID', remarks?: string) => {
    if (!selectedAllocation) return;
    try {
      await chequebookApi.updatePagesStatus(pageNos, status, remarks);
      toast.success('Page status updated successfully');
      const data = await chequebookApi.getPagesByBookNo(selectedAllocation.checkBookId, selectedAllocation.bookNo);
      setPages(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update page status.');
      throw err;
    }
  };

  const handleReturnPages = async (pageNos: number[]) => {
    if (!selectedAllocation) return;
    try {
      await chequebookApi.returnPages(pageNos);
      toast.success('Pages returned successfully');
      const data = await chequebookApi.getPagesByBookNo(selectedAllocation.checkBookId, selectedAllocation.bookNo);
      setPages(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to return pages.');
      throw err;
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;

    try {
      setIsSubmitting(true);
      await chequebookApi.approveOrReject(selectedBook.id, {
        status: approvalStatus,
        approvalRemarks,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      toast.success(
        `Record has been successfully ${approvalStatus.toLowerCase()}.`
      );
      setIsReviewOpen(false);
      await refetchBooks();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to submit review.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          className="rounded-sm"
          onClick={() => navigate('/cheque-books/create')}
        >
          Create
        </Button>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-md border border-slate-200 shadow-sm space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-50">
              <AsyncSelect
                label="Filter by Branch"
                placeholder="All Branches"
                value={selectedBranchOption}
                loadOptions={loadBranchOptions}
                defaultOptions={branchOptions}
                onChange={option => {
                  const selectedOption = Array.isArray(option)
                    ? option[0] ?? null
                    : option;

                  setBranchFilter(
                    selectedOption?.value ? String(selectedOption.value) : ''
                  );
                }}
                isClearable
                isSearchable
                pagination={false}
              />
            </div>

            <div className="w-37.5">
              <AsyncSelect
                label="Filter by Status"
                placeholder="All Statuses"
                value={selectedStatusOption}
                loadOptions={loadStatusOptions}
                defaultOptions={statusOptions}
                onChange={option => {
                  const selectedOption = Array.isArray(option)
                    ? option[0] ?? null
                    : option;

                  setStatusFilter(
                    selectedOption?.value
                      ? (String(selectedOption.value) as ChequeBookStatus)
                      : ''
                  );
                }}
                isClearable
                isSearchable
                pagination={false}
              />
            </div>
          </div>

          {/* Table */}
          {isLoading || isFetching ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border border-dashed border-slate-200 rounded-md">
              No records found.
            </div>
          ) : (
            <ChequeBookTable
              books={books}
              loading={false}
              onRowClick={book => {
                setSelectedBook(book);
                setIsReviewOpen(true);
              }}
            />
          )}
        </div>
      </div>

      {/* Review / Details Modal */}
      {selectedBook && (
        <Modal
          open={isReviewOpen}
          onOpenChange={setIsReviewOpen}
          title={
            selectedBook.status === 'Pending'
              ? 'Review Dispatch Request'
              : 'Dispatch Details'
          }
          size="md"
        >
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 border border-slate-200 rounded-md">
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Voucher No
                </span>
                <span className="font-semibold text-slate-800">
                  {selectedBook.no}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Date
                </span>
                <span className="text-slate-800">
                  {selectedBook.dispatchDate}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Branch
                </span>
                <span className="text-slate-800">
                  {selectedBook.branchName} ({selectedBook.branchCode})
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Bank Account Code
                </span>
                <span className="text-slate-800">
                  {selectedBook.bankAccountCodeLabel || selectedBook.bankAccountCode}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Book Range
                </span>
                <span className="font-semibold text-slate-800">
                  {selectedBook.bookNoFrom} - {selectedBook.bookNoTo}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Leaves Per Book
                </span>
                <span className="text-slate-800">
                  {selectedBook.vouchersPerBook}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Cheque Range
                </span>
                <span className="font-semibold text-slate-800">
                  {selectedBook.mvNoFrom} - {selectedBook.mvNoTo}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Assigned To
                </span>
                <span className="text-slate-800">
                  {resolveAssignedToLabel(selectedBook.assignedTo)}
                </span>
              </div>
              <div className="col-span-2">
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Submitter Remarks
                </span>
                <span className="text-slate-700 block italic">
                  {selectedBook.remarks || 'None'}
                </span>
              </div>
            </div>

            {selectedBook.status === 'Pending' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <AsyncSelect
                      label="Status Action"
                      placeholder="Select Action"
                      value={selectedReviewStatusOption}
                      loadOptions={loadReviewStatusOptions}
                      defaultOptions={reviewStatusOptions}
                      isSearchable={false}
                      onChange={option => {
                        const selectedOption = Array.isArray(option)
                          ? option[0] ?? null
                          : option;
                        if (selectedOption) {
                          setApprovalStatus(
                            selectedOption.value as 'Approved' | 'Rejected'
                          );
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="date"
                      label="From Date"
                      value={fromDate}
                      onChange={e => setFromDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      type="date"
                      label="To Date"
                      value={toDate}
                      onChange={e => setToDate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Approval Remarks
                  </label>
                  <textarea
                    rows={3}
                    className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-xs"
                    placeholder="Provide comments for approval or rejection..."
                    value={approvalRemarks}
                    onChange={e => setApprovalRemarks(e.target.value)}
                    required={approvalStatus === 'Rejected'}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    className="cursor-pointer border border-slate-200 text-slate-600 hover:bg-slate-50 rounded px-4 py-2 text-xs font-semibold transition"
                    onClick={() => setIsReviewOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white rounded px-4 py-2 text-xs font-semibold shadow transition flex items-center gap-1.5"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader />}
                    Submit Review
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Review Logs
                </h4>
                <div className="text-xs bg-slate-50 p-4 border border-slate-200 rounded-md space-y-2.5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-slate-400 font-semibold mb-0.5">
                        Status
                      </span>
                      <span
                        className={[
                          'px-1.5 py-0.5 rounded font-semibold text-[10px]',
                          selectedBook.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800',
                        ].join(' ')}
                      >
                        {selectedBook.status}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-semibold mb-0.5">
                        Date Range
                      </span>
                      <span>
                        {selectedBook.fromDate || 'N/A'} to{' '}
                        {selectedBook.toDate || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold mb-0.5">
                      Approval Remarks
                    </span>
                    <span className="italic block text-slate-700">
                      {selectedBook.approvalRemarks || 'None'}
                    </span>
                  </div>
                </div>
                {/* Allocations & Page Tracking */}
                {selectedBook.status === 'Approved' && (
                  <div className="mt-4 border-t border-slate-200 pt-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      User Allocations
                    </h4>
                    {isLoadingAllocations ? (
                      <div className="text-xs text-slate-400 py-2">Loading allocations...</div>
                    ) : allocations.length === 0 ? (
                      <div className="text-xs text-slate-500 italic py-2 bg-slate-50 border border-slate-100 rounded text-center">
                        No users assigned to this book yet.
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                        {allocations.map(alloc => {
                          const cashier = cashiers.find(c => c.id === alloc.cashierId);
                          return (
                            <div key={`${alloc.checkBookId}-${alloc.bookNo}`} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-md shadow-sm">
                              <div>
                                <span className="block text-xs font-bold text-slate-700">Book #{alloc.bookNo}</span>
                                <span className="text-[10px] text-slate-500">Assigned to: <b className="text-slate-700">{cashier ? cashier.name : 'Unknown User'}</b></span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleViewPages(alloc)}
                                className="cursor-pointer text-[10px] font-bold text-sky-600 hover:text-sky-700 bg-sky-50 border border-sky-100 rounded px-2.5 py-1 transition"
                              >
                                Track Pages
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    className="cursor-pointer border border-slate-200 text-slate-600 hover:bg-slate-50 rounded px-4 py-2 text-xs font-semibold transition"
                    onClick={() => setIsReviewOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </form>
        </Modal>
      )}

      {selectedAllocation && (
        <Modal
          open={isPagesModalOpen}
          onOpenChange={setIsPagesModalOpen}
          title={`Book #${selectedAllocation.bookNo} Page Tracking`}
          size="lg"
        >
          <PageGrid
            title={`Leaf range of Book #${selectedAllocation.bookNo}`}
            pages={pages.map(p => ({
              pageNo: p.pageNo,
              isVoided: p.isVoided,
              remarks: p.remarks,
            }))}
            isLoading={isLoadingPages}
            onUpdateStatus={handleUpdatePageStatus}
            onReturnPages={handleReturnPages}
          />
        </Modal>
      )}
    </div>
  );
};

export default ChequeBookListView;
