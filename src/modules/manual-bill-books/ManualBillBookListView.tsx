import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AsyncSelect,
  Button,
  PageGrid,
  type AsyncSelectOption,
  type AsyncSelectResponse,
} from '@/components/ui';
import {
  manualBillBookApi,
  type IManualBook,
  type IManualBookAllocation,
  type IManualBookPageTracking,
} from '@/api';
import { Modal } from '@/components/ui/modal/Modal';
import toast from 'react-hot-toast';
import { Loader } from '@/components/ui/loader';
import { ManualBillBookTable, CashierBillBookListView } from './components';
import {
  useApproveRejectManualBillBook,
  useListManualBillBooks,
} from './hooks';
import { useListBranchProfiles } from '@/modules/branchProfile/hooks';
import {
  ManualBillBookStatusEnum,
  type ManualBillBookReviewStatus,
  type ManualBillBookStatus,
} from './types';
import { usePermission } from '@/hooks/usePermission';
import { useAuth } from '@/lib/AuthContext';

const resolveAssignedToLabel = (assignedTo: IManualBook['assignedTo']) => {
  if (assignedTo && typeof assignedTo === 'object') {
    return assignedTo.name || assignedTo.id;
  }

  return assignedTo || 'N/A';
};

/** Normalises status to uppercase for comparison — handles both old PascalCase and new UPPERCASE DB values */
const getStatusBadgeClass = (status: string) => {
  if (status === ManualBillBookStatusEnum.APPROVE) return 'bg-emerald-100 text-emerald-800';
  if (status === ManualBillBookStatusEnum.REJECT) return 'bg-rose-100 text-rose-800';
  return 'bg-amber-100 text-amber-800'; // PENDING
};

export const ManualBillBookListView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isUserHo = (user?.isHo || user?.isHoStaff) && !user?.isAdmin;
  const isCashierOrDelivery = !!(user?.isCashier || user?.isDeliveryBoy);
  const isBranchManager = !user?.isAdmin && !isUserHo && !isCashierOrDelivery;
  const { hasAnyPermission: canAllocate } = usePermission('/manual-bill-books/allocation');
  const { hasAnyPermission: canMap } = usePermission('/manual-bill-books/dp-mapping');
  const { hasAnyPermission: canUnmap } = usePermission('/manual-bill-books/dp-unmapping');
  // Filter states
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<ManualBillBookStatus | ''>(
    ''
  );

  const statusOptions = useMemo<AsyncSelectOption[]>(
    () => [
      {
        value: ManualBillBookStatusEnum.PENDING,
        label: ManualBillBookStatusEnum.PENDING,
      },
      {
        value: ManualBillBookStatusEnum.APPROVE,
        label: ManualBillBookStatusEnum.APPROVE,
      },
      {
        value: ManualBillBookStatusEnum.REJECT,
        label: ManualBillBookStatusEnum.REJECT,
      },
    ],
    []
  );

  const selectedStatusOption = useMemo<AsyncSelectOption | null>(
    () => statusOptions.find(option => option.value === statusFilter) ?? null,
    [statusFilter, statusOptions]
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

  // Review modal states
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<IManualBook | null>(null);
  const [approvalStatus, setApprovalStatus] =
    useState<ManualBillBookReviewStatus>(ManualBillBookStatusEnum.APPROVE);
  const [approvalRemarks, setApprovalRemarks] = useState('');

  const reviewStatusOptions = useMemo<AsyncSelectOption[]>(
    () => [
      { value: ManualBillBookStatusEnum.APPROVE, label: 'APPROVE' },
      { value: ManualBillBookStatusEnum.REJECT, label: 'REJECT' },
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

  const { approveOrReject, isSubmitting } = useApproveRejectManualBillBook();
  const [searchParams] = useSearchParams();
  const reviewId = searchParams.get('reviewId');

  const {
    data: books = [],
    isLoading,
    isFetching,
    error,
    refetch: refetchBooks,
  } = useListManualBillBooks({
    branchId: branchFilter || undefined,
    status: statusFilter || undefined,
  });

  const reviewBookFromQuery = useMemo(
    () => (reviewId ? books.find(book => book.id === reviewId) ?? null : null),
    [books, reviewId]
  );
  const reviewBook = selectedBook ?? reviewBookFromQuery;

  useEffect(() => {
    if (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to load manual book records.';
      toast.error(message);
    }
  }, [error]);

  // Page Tracking allocation list & cashier list states
  const [allocations, setAllocations] = useState<IManualBookAllocation[]>([]);
  const [isLoadingAllocations, setIsLoadingAllocations] = useState(false);
  const [cashiers, setCashiers] = useState<Array<{ id: string; name: string }>>(
    []
  );

  // Sub-modal for PageGrid states
  const [selectedAllocation, setSelectedAllocation] =
    useState<IManualBookAllocation | null>(null);
  const [isPagesModalOpen, setIsPagesModalOpen] = useState(false);
  const [pages, setPages] = useState<IManualBookPageTracking[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);

  useEffect(() => {
    const fetchAllocations = async () => {
      if (!reviewBook || reviewBook.status === ManualBillBookStatusEnum.PENDING) {
        setAllocations([]);
        return;
      }
      try {
        setIsLoadingAllocations(true);
        const data = await manualBillBookApi.getAllocations([reviewBook.id]);
        setAllocations(data);
      } catch (err: unknown) {
        console.error('Failed to load allocations:', err);
      } finally {
        setIsLoadingAllocations(false);
      }
    };
    fetchAllocations();
  }, [reviewBook]);

  useEffect(() => {
    const fetchCashiers = async () => {
      if (!reviewBook) return;
      try {
        const data = await manualBillBookApi.getAuthorizedUsers();
        setCashiers(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCashiers();
  }, [reviewBook]);

  const handleViewPages = async (alloc: IManualBookAllocation) => {
    setSelectedAllocation(alloc);
    setIsPagesModalOpen(true);
    try {
      setIsLoadingPages(true);
      const data = await manualBillBookApi.getPagesByBookNo(
        alloc.manualBookId,
        alloc.bookNo
      );
      setPages(data);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Failed to load page tracking records.'
      );
    } finally {
      setIsLoadingPages(false);
    }
  };

  const handleUpdatePageStatus = async (
    pageNos: number[],
    status: 'VOID',
    remarks?: string
  ) => {
    if (!selectedAllocation) return;
    try {
      await manualBillBookApi.updatePagesStatus(pageNos, status, remarks);
      toast.success('Page status updated successfully');
      const data = await manualBillBookApi.getPagesByBookNo(
        selectedAllocation.manualBookId,
        selectedAllocation.bookNo
      );
      setPages(data);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update page status.'
      );
      throw err;
    }
  };

  const handleReturnPages = async (pageNos: number[]) => {
    if (!selectedAllocation) return;
    try {
      await manualBillBookApi.returnPages(pageNos);
      toast.success('Pages returned successfully');
      const data = await manualBillBookApi.getPagesByBookNo(
        selectedAllocation.manualBookId,
        selectedAllocation.bookNo
      );
      setPages(data);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to return pages.'
      );
      throw err;
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBook) return;

    try {
      await approveOrReject({
        id: reviewBook.id,
        data: {
          status: approvalStatus,
          approvalRemarks,
        },
      });
      toast.success(
        `Record has been successfully ${approvalStatus.toLowerCase()}.`
      );
      if (reviewBookFromQuery) {
        const nextSearchParams = new URLSearchParams(searchParams);
        nextSearchParams.delete('reviewId');
        navigate({ search: nextSearchParams.toString() });
      } else {
        setIsReviewOpen(false);
      }
      setSelectedBook(null);
      await refetchBooks();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to submit review.'
      );
    }
  };

  // Reassign state (HO reassigning a REJECTED dispatch)
  const [reassignUserId, setReassignUserId] = useState('');
  const [reassignRemarks, setReassignRemarks] = useState('');
  const [reassignUsers, setReassignUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [isReassigning, setIsReassigning] = useState(false);

  useEffect(() => {
    if (!selectedBook || selectedBook.status !== ManualBillBookStatusEnum.REJECT) return;
    manualBillBookApi.getBranchManagers(selectedBook.branchId)
      .then(setReassignUsers)
      .catch(console.error);
  }, [selectedBook]);

  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !reassignUserId) return;
    try {
      setIsReassigning(true);
      await manualBillBookApi.reassignDispatch(selectedBook.id, {
        assignedTo: reassignUserId,
        remarks: reassignRemarks || undefined,
      });
      toast.success('Dispatch reassigned and reset to Pending.');
      setIsReviewOpen(false);
      setReassignUserId('');
      setReassignRemarks('');
      await refetchBooks();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to reassign dispatch.');
    } finally {
      setIsReassigning(false);
    }
  };

  if (isCashierOrDelivery) {
    return <CashierBillBookListView />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => navigate('/manual-bill-books/create')}
        >
          Create
        </Button>
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center mb-2">
          {!isBranchManager && (
            <div className="flex-1 min-w-50">
              <AsyncSelect
                label="Filter by Branch"
                placeholder="All Branches"
                value={selectedBranchOption}
                loadOptions={loadBranchOptions}
                defaultOptions={branchOptions}
                onChange={option => {
                  const selectedOption = Array.isArray(option)
                    ? (option[0] ?? null)
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
          )}

          <div className="w-37.5">
            <AsyncSelect
              label="Filter by Status"
              placeholder="All Statuses"
              value={selectedStatusOption}
              loadOptions={loadStatusOptions}
              defaultOptions={statusOptions}
              onChange={option => {
                const selectedOption = Array.isArray(option)
                  ? (option[0] ?? null)
                  : option;

                setStatusFilter(
                  selectedOption?.value
                    ? (String(selectedOption.value) as ManualBillBookStatus)
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

        <div className="overflow-x-auto border border-slate-200 rounded-md">
          <ManualBillBookTable
            books={books}
            loading={isLoading || isFetching}
            onRowClick={book => {
              // HO clicking a REJECTED book → redirect to create page pre-filled for reassignment
              if (
                book.status === ManualBillBookStatusEnum.REJECT &&
                (user?.isHo || user?.isHoStaff || user?.isAdmin)
              ) {
                navigate(`/manual-bill-books/create?reassignId=${book.id}`);
                return;
              }
              if (book.status === ManualBillBookStatusEnum.APPROVE && !isUserHo) {
                if (canAllocate) {
                  navigate(`/manual-bill-books/allocation?bookId=${book.id}`);
                } else if (canMap) {
                  navigate(`/manual-bill-books/dp-mapping?bookId=${book.id}`);
                } else if (canUnmap) {
                  navigate(`/manual-bill-books/dp-unmapping?bookId=${book.id}`);
                } else {
                  setSelectedBook(book);
                  setIsReviewOpen(true);
                }
              } else {
                setSelectedBook(book);
                setIsReviewOpen(true);
              }
            }}
          />
        </div>
      </section>

      {/* Review / Details Modal */}
      {reviewBook && (
        <Modal
          open={isReviewOpen}
          onOpenChange={open => {
            setIsReviewOpen(open);
            if (!open) { setReassignUserId(''); setReassignRemarks(''); }
          }}
          title={
            reviewBook?.status === ManualBillBookStatusEnum.PENDING
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
                  {reviewBook.no}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Date
                </span>
                <span className="text-slate-800">
                  {reviewBook.dispatchDate}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Branch
                </span>
                <span className="text-slate-800">
                  {reviewBook.branchName} ({reviewBook.branchCode})
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Txn Type
                </span>
                <span className="text-slate-800">
                  {reviewBook.transactionTypeLabel || reviewBook.transactionType}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Book Range
                </span>
                <span className="font-semibold text-slate-800">
                  {reviewBook.bookNoFrom} - {reviewBook.bookNoTo}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Vouchers Per Book
                </span>
                <span className="text-slate-800">
                  {reviewBook.vouchersPerBook}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">
                  MV Range
                </span>
                <span className="font-semibold text-slate-800">
                  {reviewBook.mvNoFrom} - {reviewBook.mvNoTo}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Assigned To
                </span>
                <span className="text-slate-800">
                  {resolveAssignedToLabel(reviewBook.assignedTo)}
                </span>
              </div>
              <div className="col-span-2">
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Submitter Remarks
                </span>
                <span className="text-slate-700 block italic">
                  {reviewBook.remarks || 'None'}
                </span>
              </div>
            </div>

            {reviewBook?.status === ManualBillBookStatusEnum.PENDING && !isUserHo ? (
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
                            selectedOption.value as ManualBillBookReviewStatus
                          );
                        }
                      }}
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
                    required={approvalStatus === ManualBillBookStatusEnum.REJECT}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (reviewBookFromQuery) {
                        const nextSearchParams = new URLSearchParams(
                          searchParams
                        );
                        nextSearchParams.delete('reviewId');
                        navigate({ search: nextSearchParams.toString() });
                      } else {
                        setIsReviewOpen(false);
                      }
                      setSelectedBook(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader variant="spinner" />}
                    Submit Review
                  </Button>
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
                        className={`px-1.5 py-0.5 rounded font-semibold text-[10px] ${getStatusBadgeClass(reviewBook?.status ?? '')}`}
                      >
                        {reviewBook.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold mb-0.5">
                      Approval Remarks
                    </span>
                    <span className="italic block text-slate-700">
                      {reviewBook.approvalRemarks || 'None'}
                    </span>
                  </div>
                </div>
                {/* HO Reassign panel for REJECTED dispatches */}
                {reviewBook?.status === ManualBillBookStatusEnum.REJECT && (user?.isHo || user?.isHoStaff || user?.isAdmin) && (
                  <form onSubmit={handleReassignSubmit} className="mt-4 border-t border-slate-200 pt-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Edit &amp; Reassign
                    </h4>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Assign To <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-xs"
                        value={reassignUserId}
                        onChange={e => setReassignUserId(e.target.value)}
                        required
                      >
                        <option value="">Select a user...</option>
                        {reassignUsers.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Remarks
                      </label>
                      <textarea
                        rows={2}
                        className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-xs"
                        placeholder="Optional remarks for this reassignment..."
                        value={reassignRemarks}
                        onChange={e => setReassignRemarks(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="submit"
                        className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white rounded px-4 py-2 text-xs font-semibold shadow transition flex items-center gap-1.5"
                        disabled={isReassigning || !reassignUserId}
                      >
                        {isReassigning && <Loader variant="spinner" />}
                        Reassign &amp; Reset to Pending
                      </button>
                    </div>
                  </form>
                )}

                {/* Allocations & Page Tracking */}
                {reviewBook?.status === ManualBillBookStatusEnum.APPROVE && (
                  <div className="mt-4 border-t border-slate-200 pt-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      User Allocations
                    </h4>
                    {isLoadingAllocations ? (
                      <div className="text-xs text-slate-400 py-2">
                        Loading allocations...
                      </div>
                    ) : allocations.length === 0 ? (
                      <div className="text-xs text-slate-500 italic py-2 bg-slate-50 border border-slate-100 rounded text-center">
                        No users assigned to this book yet.
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                        {allocations.map(alloc => {
                          const cashier = cashiers.find(
                            c => c.id === alloc.cashierId
                          );
                          return (
                            <div
                              key={`${alloc.manualBookId}-${alloc.bookNo}`}
                              className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-md shadow-sm"
                            >
                              <div>
                                <span className="block text-xs font-bold text-slate-700">
                                  Book #{alloc.bookNo}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  Assigned to:{' '}
                                  <b className="text-slate-700">
                                    {cashier ? cashier.name : 'Unknown User'}
                                  </b>
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleViewPages(alloc)}
                                size="sm"
                              >
                                Track Pages
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (reviewBookFromQuery) {
                        const nextSearchParams = new URLSearchParams(
                          searchParams
                        );
                        nextSearchParams.delete('reviewId');
                        navigate({ search: nextSearchParams.toString() });
                      } else {
                        setIsReviewOpen(false);
                      }
                      setSelectedBook(null);
                    }}
                  >
                    Close
                  </Button>
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

export default ManualBillBookListView;
