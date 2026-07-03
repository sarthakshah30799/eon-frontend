import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type IManualBook } from '@/api';
import { Modal } from '@/components/ui/modal/Modal';
import {
  AsyncSelect,
  Button,
  type AsyncSelectOption,
  type AsyncSelectResponse,
} from '@/components/ui';
import toast from 'react-hot-toast';
import { Loader } from '@/components/ui/loader';
import { ManualBillBookTable } from './components';
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

export const ManualBillBookListView = () => {
  // Filter states
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<ManualBillBookStatus | ''>(
    ''
  );

  const navigate = useNavigate();

  const statusOptions = useMemo<AsyncSelectOption[]>(
    () => [
      {
        value: ManualBillBookStatusEnum.PENDING,
        label: ManualBillBookStatusEnum.PENDING,
      },
      {
        value: ManualBillBookStatusEnum.APPROVED,
        label: ManualBillBookStatusEnum.APPROVED,
      },
      {
        value: ManualBillBookStatusEnum.REJECTED,
        label: ManualBillBookStatusEnum.REJECTED,
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
  const [selectedBook] = useState<IManualBook | null>(null);
  const [approvalStatus, setApprovalStatus] =
    useState<ManualBillBookReviewStatus>(ManualBillBookStatusEnum.APPROVED);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [approvalRemarks, setApprovalRemarks] = useState('');

  const { approveOrReject, isSubmitting } = useApproveRejectManualBillBook();

  const {
    data: books = [],
    isLoading,
    error,
    refetch: refetchBooks,
  } = useListManualBillBooks({
    branchId: branchFilter || undefined,
    status: statusFilter || undefined,
  });

  useEffect(() => {
    if (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to load manual book records.';
      toast.error(message);
    }
  }, [error]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;

    try {
      await approveOrReject({
        id: selectedBook.id,
        data: {
          status: approvalStatus,
          approvalRemarks,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        },
      });
      toast.success(
        `Record has been successfully ${approvalStatus.toLowerCase()}.`
      );
      setIsReviewOpen(false);
      await refetchBooks();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to submit review.'
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => navigate('/admin/manual-bill-books/create')}
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
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border border-dashed border-slate-200 rounded-md">
              No records found.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-md">
              <ManualBillBookTable books={books} />
            </div>
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
                  Txn Type
                </span>
                <span className="text-slate-800">
                  {selectedBook.transactionType}
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
                  Vouchers Per Book
                </span>
                <span className="text-slate-800">
                  {selectedBook.vouchersPerBook}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">
                  MV Range
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
                  {selectedBook.assignedTo}
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
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Status Action
                    </label>
                    <select
                      className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-xs font-medium"
                      value={approvalStatus}
                      onChange={e =>
                        setApprovalStatus(
                          e.target.value as ManualBillBookReviewStatus
                        )
                      }
                    >
                      <option value="Approved">Approve</option>
                      <option value="Rejected">Reject</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      From Date
                    </label>
                    <input
                      type="date"
                      className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-xs"
                      value={fromDate}
                      onChange={e => setFromDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      To Date
                    </label>
                    <input
                      type="date"
                      className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-xs"
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
                <div className="flex justify-end">
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
    </div>
  );
};

export default ManualBillBookListView;
