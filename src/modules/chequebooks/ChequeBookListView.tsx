import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { chequebookApi, type IChequeBook } from '@/api';
import { Modal } from '@/components/ui/modal/Modal';
import toast from 'react-hot-toast';
import { Loader } from '@/components/ui/loader';
import {
  AsyncSelect,
  Button,
  type AsyncSelectOption,
  type AsyncSelectResponse,
} from '@/components/ui';
import {
  buildBranchToolbarFilter,
  buildStaticAsyncSelectToolbarFilter,
} from '@/components/ui/table';
import { useOffsetPaginatedList } from '@/hooks';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { useGetChequeBook } from './hooks';
import { useLoadBranchOptions } from '@/modules/branchProfile/hooks';
import { ChequeBookTable } from './components';
import { CashierChequeBookListView } from './components/CashierChequeBookListView';
import {
  ChequeBookStatusEnum,
  type ChequeBookStatus,
  type ChequeBookReviewStatus,
} from './types';
import { useAuth } from '@/lib/AuthContext';

const resolveAssignedToLabel = (assignedTo: IChequeBook['assignedTo']) => {
  if (assignedTo && typeof assignedTo === 'object') {
    return assignedTo.name || assignedTo.id;
  }

  return assignedTo || 'N/A';
};

/** Normalises status to uppercase for comparison — handles both old PascalCase and new UPPERCASE DB values */
export const ChequeBookListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const reviewId = searchParams.get('reviewId');
  const canSeeBranchFilter = Boolean(
    user?.isAdmin || user?.isHo || user?.isHoStaff
  );
  const isCashierOrDelivery = !!(user?.isCashier || user?.isDeliveryBoy);
  const isHoStaff = !!(user?.isHo || user?.isHoStaff) && !user?.isAdmin;
  const isBranchManager = !user?.isAdmin && !isHoStaff && !isCashierOrDelivery;

  // Filter states
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<ChequeBookStatus | ''>('');

  // Review modal states
  const [approvalStatus, setApprovalStatus] = useState<ChequeBookReviewStatus>(
    ChequeBookStatusEnum.APPROVE
  );
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reviewStatusOptions = useMemo<AsyncSelectOption[]>(
    () => [
      { value: ChequeBookStatusEnum.APPROVE, label: 'APPROVE' },
      { value: ChequeBookStatusEnum.REJECT, label: 'REJECT' },
    ],
    []
  );

  const selectedReviewStatusOption = useMemo<AsyncSelectOption | null>(
    () =>
      reviewStatusOptions.find(option => option.value === approvalStatus) ??
      null,
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

  const loadBranchOptions = useLoadBranchOptions({ activeOnly: true });
  const [selectedBranchOption, setSelectedBranchOption] =
    useState<AsyncSelectOption | null>(null);

  const statusOptions = useMemo<AsyncSelectOption[]>(
    () => [
      {
        value: ChequeBookStatusEnum.PENDING,
        label: ChequeBookStatusEnum.PENDING,
      },
      {
        value: ChequeBookStatusEnum.APPROVE,
        label: ChequeBookStatusEnum.APPROVE,
      },
      {
        value: ChequeBookStatusEnum.REJECT,
        label: ChequeBookStatusEnum.REJECT,
      },
    ],
    []
  );

  const selectedStatusOption = useMemo<AsyncSelectOption | null>(
    () => statusOptions.find(option => option.value === statusFilter) ?? null,
    [statusFilter, statusOptions]
  );

  const filters = useMemo(
    () => ({
      branchId: branchFilter || undefined,
      status: statusFilter || undefined,
    }),
    [branchFilter, statusFilter]
  );

  const resetOffset = useCallback(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('offset', String(PAGINATION_DEFAULTS.OFFSET));
      if (!next.has('limit')) {
        next.set('limit', String(PAGINATION_DEFAULTS.LIMIT));
      }
      return next;
    });
  }, [setSearchParams]);

  const toolbarFilters = useMemo(
    () => [
      buildBranchToolbarFilter({
        visible: canSeeBranchFilter,
        label: 'Branch',
        value: selectedBranchOption,
        loadOptions: loadBranchOptions,
        onChange: option => {
          setSelectedBranchOption(option);
          setBranchFilter(option?.value ? String(option.value) : '');
          resetOffset();
        },
      }),
      buildStaticAsyncSelectToolbarFilter({
        id: 'status',
        label: 'Status',
        options: statusOptions,
        value: selectedStatusOption,
        placeholder: 'All Statuses',
        onChange: option => {
          setStatusFilter(
            option?.value
              ? (String(option.value) as ChequeBookStatus)
              : ''
          );
          resetOffset();
        },
      }),
    ],
    [
      canSeeBranchFilter,
      loadBranchOptions,
      resetOffset,
      selectedBranchOption,
      selectedStatusOption,
      statusOptions,
    ]
  );

  const {
    rows: books,
    isLoading,
    isFetching,
    error,
    refetch: refetchBooks,
    page,
    limit,
    total,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
  } = useOffsetPaginatedList({
    queryKey: ['cheque-books'],
    queryFn: params => chequebookApi.findAll(params),
    filters,
  });

  const {
    data: routedBook,
    error: routedBookError,
    isFetched: isRoutedBookFetched,
  } = useGetChequeBook(reviewId ?? undefined);

  const reviewBook = useMemo(
    () =>
      reviewId
        ? (books.find(book => book.id === reviewId) ?? routedBook ?? null)
        : null,
    [books, reviewId, routedBook]
  );
  const isReviewModalOpen = Boolean(reviewBook);

  const closeReview = useCallback(() => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('reviewId');
    navigate({ search: nextSearchParams.toString() });
  }, [navigate, searchParams]);

  const openReview = useCallback(
    (bookId: string) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.set('reviewId', bookId);
      navigate({ search: nextSearchParams.toString() });
    },
    [navigate, searchParams]
  );

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
    if (!reviewId || isLoading || !isRoutedBookFetched) return;
    if (books.some(book => book.id === reviewId) || routedBook) return;
    toast.error(
      routedBookError instanceof Error
        ? routedBookError.message
        : 'Dispatch not found.'
    );
    closeReview();
  }, [
    books,
    closeReview,
    isLoading,
    isRoutedBookFetched,
    reviewId,
    routedBook,
    routedBookError,
  ]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBook) return;

    try {
      setIsSubmitting(true);
      await chequebookApi.approveOrReject(reviewBook.id, {
        status: approvalStatus,
        approvalRemarks,
      });
      toast.success(
        `Record has been successfully ${approvalStatus.toLowerCase()}.`
      );
      closeReview();
      await refetchBooks();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to submit review.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCashierOrDelivery) {
    return <CashierChequeBookListView />;
  }

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

      <section className="rounded-sm border border-border-primary bg-surface-primary p-3 shadow-sm">
        <ChequeBookTable
          books={books}
          loading={isLoading}
          isFetching={isFetching}
          manualPagination
          page={page}
          pageSize={limit}
          total={total}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          toolbarFilters={toolbarFilters}
          onRowClick={book => {
              if (isHoStaff && book.status === ChequeBookStatusEnum.REJECT) {
                navigate(`/cheque-books/create?reassignId=${book.id}`);
                return;
              }
              if (
                isBranchManager &&
                book.status === ChequeBookStatusEnum.APPROVE
              ) {
                navigate(`/cheque-books/allocation?bookId=${book.id}`);
                return;
              }
            openReview(book.id);
          }}
        />
      </section>

      {/* Review / Details Modal */}
      {reviewBook && (
        <Modal
          open={isReviewModalOpen}
          onOpenChange={open => {
            if (!open) closeReview();
          }}
          title={
            reviewBook?.status === ChequeBookStatusEnum.PENDING
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
                  {reviewBook?.no}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Date
                </span>
                <span className="text-slate-800">
                  {reviewBook?.dispatchDate}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Branch
                </span>
                <span className="text-slate-800">
                  {reviewBook?.branchName} ({reviewBook?.branchCode})
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Bank Account Code
                </span>
                <span className="text-slate-800">
                  {reviewBook?.bankAccountCodeLabel ||
                    reviewBook?.bankAccountCode}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Book Range
                </span>
                <span className="font-semibold text-slate-800">
                  {reviewBook?.bookNoFrom} - {reviewBook?.bookNoTo}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Leaves Per Book
                </span>
                <span className="text-slate-800">
                  {reviewBook?.vouchersPerBook}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Cheque Range
                </span>
                <span className="font-semibold text-slate-800">
                  {reviewBook?.mvNoFrom} - {reviewBook?.mvNoTo}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Assigned To
                </span>
                <span className="text-slate-800">
                  {resolveAssignedToLabel(reviewBook?.assignedTo)}
                </span>
              </div>
              <div className="col-span-2">
                <span className="block text-slate-400 font-semibold mb-0.5">
                  Submitter Remarks
                </span>
                <span className="text-slate-700 block italic">
                  {reviewBook?.remarks || 'None'}
                </span>
              </div>
            </div>

            {reviewBook?.status === ChequeBookStatusEnum.PENDING ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <AsyncSelect
                      label="Status Action"
                      placeholder="Select Action"
                      value={selectedReviewStatusOption}
                      loadOptions={loadReviewStatusOptions}
                      defaultOptions={reviewStatusOptions}
                      onChange={option => {
                        const selectedOption = Array.isArray(option)
                          ? (option[0] ?? null)
                          : option;
                        if (selectedOption) {
                          setApprovalStatus(
                            selectedOption.value as ChequeBookReviewStatus
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
                    required={approvalStatus === ChequeBookStatusEnum.REJECT}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={closeReview}>
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
                        className={[
                          'px-1.5 py-0.5 rounded font-semibold text-[10px]',
                          reviewBook?.status === ChequeBookStatusEnum.APPROVE
                            ? 'bg-emerald-100 text-emerald-800'
                            : reviewBook?.status === ChequeBookStatusEnum.REJECT
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800',
                        ].join(' ')}
                      >
                        {reviewBook?.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold mb-0.5">
                      Approval Remarks
                    </span>
                    <span className="italic block text-slate-700">
                      {reviewBook?.approvalRemarks || 'None'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <Button type="button" variant="outline" onClick={closeReview}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ChequeBookListView;
