import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { manualBillBookApi, type IManualBook } from '@/api';
import {
  Button,
  AsyncSelect,
  DatePicker,
  type AsyncSelectOption,
} from '@/components/ui';
import { formatDateInput, parseDateInput } from '@/utils';
import type { MultiValue, SingleValue } from 'react-select';
import toast from 'react-hot-toast';
import {
  ManualBillBookAcknowledgementChecklistTable,
  ManualBillBookTable,
} from '@/modules/manual-bill-books/components';
import { useListManualBillBooks } from '@/modules/manual-bill-books/hooks';
import {
  ManualBillBookStatusEnum,
  type ManualBillBookReviewStatus,
} from '@/modules/manual-bill-books/types';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import { useCategoryOptions, useDebounce } from '@/hooks';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';

export const ManualBillBookAcknowledgementPage = () => {
  const { activeBranchId } = useAuth();

  const [view, setView] = useState<'list' | 'detail'>('list');

  const {
    data: listResponse,
    isLoading,
    isFetching,
    refetch: refetchBooks,
    limit = PAGINATION_DEFAULTS.LIMIT,
    page = 1,
    total = 0,
    totalPages = 0,
    handlePageChange = () => undefined,
    handlePageSizeChange = () => undefined,
    handleSearchChange = () => undefined,
    search: routeSearch,
  } = useListManualBillBooks(
    { branchId: activeBranchId ?? undefined },
    { withRoutePagination: true }
  );
  const dispatches: IManualBook[] = listResponse?.data ?? [];

  const [searchInput, setSearchInput] = useState(routeSearch ?? '');
  const debouncedSearch = useDebounce(searchInput, 350);

  useEffect(() => {
    const nextSearch = debouncedSearch.trim();
    if ((nextSearch || undefined) === (routeSearch || undefined)) return;
    handleSearchChange(debouncedSearch);
  }, [debouncedSearch, handleSearchChange, routeSearch]);

  const [searchStatus, setSearchStatus] = useState('PENDING');
  const [searchTxnType, setSearchTxnType] = useState('ALL');
  const { defaultOptions: txnTypes, loadOptions: loadTxnTypeOptions } =
    useCategoryOptions(CategoryOptionCodeEnum.Transaction, true);

  const getPastDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d;
  };
  const [fromDate, setFromDate] = useState(formatDateInput(getPastDate(30)));
  const [toDate, setToDate] = useState(formatDateInput(getPastDate(0)));

  const [queryResults, setQueryResults] = useState<IManualBook[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [rowEdits, setRowEdits] = useState<
    Record<string, { status?: ManualBillBookReviewStatus; remarks: string }>
  >({});
  const selectedTxnType = txnTypes.find(t => t.value === searchTxnType);

  const handleProcessQuery = async () => {
    if (!activeBranchId) return;
    if (!fromDate || !toDate) {
      toast.error('Please select From Date and To Date.');
      return;
    }
    if (fromDate > toDate) {
      toast.error('From Date must be on or before To Date.');
      return;
    }
    try {
      setIsProcessing(true);
      const data = await manualBillBookApi.findAllMatching({
        branchId: activeBranchId,
        status: searchStatus || undefined,
        transactionType: searchTxnType === 'ALL' ? undefined : searchTxnType,
        fromDate,
        toDate,
      });
      setQueryResults(data);
      setRowEdits({});
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to query records.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckboxChange = (
    id: string,
    status: ManualBillBookReviewStatus
  ) => {
    setRowEdits(prev => {
      const current = prev[id] || { remarks: '' };
      const nextStatus = current.status === status ? undefined : status;
      return {
        ...prev,
        [id]: {
          ...current,
          status: nextStatus,
        },
      };
    });
  };

  const handleRemarksChange = (id: string, text: string) => {
    setRowEdits(prev => {
      const current = prev[id] || { remarks: '' };
      return {
        ...prev,
        [id]: {
          ...current,
          remarks: text,
        },
      };
    });
  };

  const handleSaveReviews = async () => {
    const reviewsToSubmit = Object.entries(rowEdits)
      .filter(([, edit]) => edit.status !== undefined)
      .map(([id, edit]) => ({
        id,
        status: edit.status!,
        approvalRemarks: edit.remarks,
      }));

    if (reviewsToSubmit.length === 0) {
      toast.error('No changes selected to save.');
      return;
    }

    try {
      setIsSaving(true);
      await manualBillBookApi.bulkReview(reviewsToSubmit);
      toast.success('Acknowledgements saved successfully.');

      // Refresh current query to hide processed items (if filtered by Pending)
      await handleProcessQuery();
      await refetchBooks();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to save acknowledgements.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRowClick = (book: IManualBook) => {
    // Pre-populate filter parameters
    setSearchStatus(book.status);
    setSearchTxnType(String(book.transactionType));

    const dispatchDate = new Date(book.dispatchDate);
    const fromD = new Date(dispatchDate);
    fromD.setDate(fromD.getDate() - 15);
    const toD = new Date(dispatchDate);
    toD.setDate(toD.getDate() + 15);

    setFromDate(formatDateInput(fromD));
    setToDate(formatDateInput(toD));

    setView('detail');

    // Clear previous query results (do not auto-process)
    setQueryResults([]);
    setRowEdits({});
  };

  if (!activeBranchId) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-slate-500 font-medium">
          Please select your active branch workplace to proceed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-slate-200 pb-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Manual Bill Status
          </h1>
          {view === 'detail' && (
            <Button onClick={() => setView('list')}>Back to List</Button>
          )}
        </div>
        <p className="text-sm text-slate-500">
          Acknowledge and process manual bill books allocated to your branch.
        </p>
      </div>

      {view === 'list' ? (
        <div className="rounded-sm border border-border-primary bg-surface-primary p-3 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">
            Dispatches
          </h3>
          <ManualBillBookTable
            books={dispatches}
            loading={isLoading}
            isFetching={isFetching}
            page={page}
            pageSize={limit}
            total={total}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            searchValue={searchInput}
            onSearch={setSearchInput}
            onRowClick={handleRowClick}
            emptyMessage="No dispatches found for this branch."
          />
          <div className="mt-4">
            <Button
              onClick={() => {
                setView('detail');
                setQueryResults([]);
              }}
            >
              Go to Manual Bill Status Search
            </Button>
          </div>
        </div>
      ) : (
        /* Detailed / Process checklist View */
        <div className="space-y-6">
          {/* Filters panel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              Manual Bill
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div>
                <AsyncSelect
                  label="Status *"
                  placeholder="Select Status"
                  value={
                    searchStatus === ''
                      ? { value: '', label: 'All' }
                      : [
                          {
                            value: ManualBillBookStatusEnum.PENDING,
                            label: 'PENDING',
                          },
                          {
                            value: ManualBillBookStatusEnum.APPROVE,
                            label: 'APPROVED',
                          },
                          {
                            value: ManualBillBookStatusEnum.REJECT,
                            label: 'REJECTED',
                          },
                        ].find(o => o.value === searchStatus)
                  }
                  onChange={(
                    option:
                      | MultiValue<AsyncSelectOption>
                      | SingleValue<AsyncSelectOption>
                  ) => {
                    const selectedOption = Array.isArray(option)
                      ? (option[0] ?? null)
                      : option;

                    setSearchStatus(
                      selectedOption?.value ? String(selectedOption.value) : ''
                    );
                  }}
                  loadOptions={async (inputValue: string) => {
                    const opts = [
                      {
                        value: ManualBillBookStatusEnum.PENDING,
                        label: 'PENDING',
                      },
                      {
                        value: ManualBillBookStatusEnum.APPROVE,
                        label: 'APPROVED',
                      },
                      {
                        value: ManualBillBookStatusEnum.REJECT,
                        label: 'REJECTED',
                      },
                      { value: '', label: 'All' },
                    ];
                    return {
                      options: inputValue
                        ? opts.filter(opt =>
                            opt.label
                              .toLowerCase()
                              .includes(inputValue.toLowerCase())
                          )
                        : opts,
                      hasMore: false,
                    };
                  }}
                  isClearable={false}
                />
              </div>

              <div>
                <AsyncSelect
                  key={txnTypes.length}
                  label="Transaction Type"
                  placeholder="Select Type"
                  value={
                    searchTxnType === 'ALL'
                      ? { value: 'ALL', label: 'ALL' }
                      : selectedTxnType
                        ? { value: searchTxnType, label: selectedTxnType.label }
                        : null
                  }
                  onChange={(
                    option:
                      | MultiValue<AsyncSelectOption>
                      | SingleValue<AsyncSelectOption>
                  ) => {
                    const selectedOption = Array.isArray(option)
                      ? (option[0] ?? null)
                      : option;

                    setSearchTxnType(
                      selectedOption?.value
                        ? String(selectedOption.value)
                        : 'ALL'
                    );
                  }}
                  loadOptions={async (inputValue: string) => {
                    const response = await loadTxnTypeOptions(inputValue);
                    return {
                      options: [
                        { value: 'ALL', label: 'ALL' },
                        ...response.options,
                      ],
                      hasMore: false,
                    };
                  }}
                  isClearable={false}
                />
              </div>

              <div>
                <DatePicker
                  label="From Date *"
                  selected={fromDate ? parseDateInput(fromDate) : null}
                  onChange={date => {
                    setFromDate(date ? formatDateInput(date) : '');
                  }}
                />
              </div>

              <div>
                <DatePicker
                  label="To Date *"
                  selected={toDate ? parseDateInput(toDate) : null}
                  onChange={date => {
                    setToDate(date ? formatDateInput(date) : '');
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleProcessQuery} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Process'}
              </Button>
            </div>
          </div>

          {/* Results Checklist table */}
          <section className="rounded-sm border border-border-primary bg-surface-primary p-3 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-sm">
                Dispatches Checklist
              </h3>
            </div>

            <ManualBillBookAcknowledgementChecklistTable
              books={queryResults}
              rowEdits={rowEdits}
              onCheckboxChange={handleCheckboxChange}
              onRemarksChange={handleRemarksChange}
            />

            {queryResults.length > 0 && (
              <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                <Button onClick={handleSaveReviews} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default ManualBillBookAcknowledgementPage;
