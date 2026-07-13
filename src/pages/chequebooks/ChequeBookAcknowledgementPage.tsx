import { useState, useEffect } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useAuth } from '@/lib/AuthContext';
import { chequebookApi, type IChequeBook } from '@/api';
import toast from 'react-hot-toast';
import { FormFieldSelect } from '@/components/forms';
import { accountProfileApi } from '@/api/accountProfile/accountProfile.api';
import {
  AsyncSelect,
  Button,
  type AsyncSelectOption,
  type AsyncSelectResponse,
} from '@/components/ui';
import {
  ChequeBookAcknowledgementChecklistTable,
  ChequeBookAcknowledgementDispatchTable,
  type ChequeBookAcknowledgementRowEdit,
} from '@/modules/chequebooks/components';
import { useListChequeBookDispatches } from '@/modules/chequebooks/hooks';
import {
  ChequeBookStatusEnum,
  type ChequeBookStatus,
} from '@/modules/chequebooks/types';

const ACCOUNT_PROFILE_OPTION_PAGE_SIZE = 30;

export const ChequeBookAcknowledgementPage = () => {
  const { activeBranchId } = useAuth();
  const txnTypeForm = useForm<{
    bankAccountCode: string;
  }>({
    defaultValues: {
      bankAccountCode: '',
    },
  });
  const watchedBankAccountCode = useWatch({
    control: txnTypeForm.control,
    name: 'bankAccountCode',
  });

  const currentBankAccountCode = watchedBankAccountCode || 'ALL';

  // Navigation: 'list' | 'detail'
  const [view, setView] = useState<'list' | 'detail'>('list');

  // Filter states for Detail View
  const [searchStatus, setSearchStatus] = useState<ChequeBookStatus | ''>(
    ChequeBookStatusEnum.PENDING
  );
  // Checklist table results
  const [queryResults, setQueryResults] = useState<IChequeBook[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [rowEdits, setRowEdits] = useState<
    Record<string, ChequeBookAcknowledgementRowEdit>
  >({});

  const [prevBankAccountCode, setPrevBankAccountCode] = useState(watchedBankAccountCode);
  if (watchedBankAccountCode !== prevBankAccountCode) {
    setPrevBankAccountCode(watchedBankAccountCode);
    setSelectedBookId(null);
  }

  const statusOptions = [
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
  ] satisfies AsyncSelectOption[];

  const selectedStatusOption =
    statusOptions.find(option => option.value === searchStatus) ?? null;

  const loadStatusOptions = async (
    inputValue: string
  ): Promise<AsyncSelectResponse> => {
    const normalizedInput = inputValue.trim().toLowerCase();
    const options = normalizedInput
      ? statusOptions.filter(option =>
        option.label.toLowerCase().includes(normalizedInput)
      )
      : statusOptions;

    return { options };
  };

  const {
    data: dispatches = [],
    isLoading: isLoadingList,
    isFetching: isFetchingList,
    error: dispatchesError,
    refetch: refetchDispatches,
  } = useListChequeBookDispatches(activeBranchId ?? null);

  useEffect(() => {
    if (dispatchesError) {
      toast.error(
        dispatchesError instanceof Error
          ? dispatchesError.message
          : 'Failed to fetch dispatches list.'
      );
    }
  }, [dispatchesError]);

  const handleProcessQuery = async () => {
    if (!activeBranchId) return;
    try {
      setIsProcessing(true);
      const data = await chequebookApi.findAll(
        activeBranchId,
        searchStatus || undefined,
        currentBankAccountCode === 'ALL' ? undefined : currentBankAccountCode,
      );
      if (selectedBookId) {
        setQueryResults(data.filter(b => b.id === selectedBookId));
      } else {
        setQueryResults(data);
      }
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
    status: typeof ChequeBookStatusEnum.APPROVE | typeof ChequeBookStatusEnum.REJECT
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
      await chequebookApi.bulkReview(reviewsToSubmit);
      toast.success('Acknowledgements saved successfully.');

      // Refresh current query to hide processed items (if filtered by Pending)
      await handleProcessQuery();
      // Also refresh master list
      await refetchDispatches();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to save acknowledgements.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRowClick = (book: IChequeBook) => {
    // Pre-populate filter parameters
    setSearchStatus(book.status as ChequeBookStatus);
    txnTypeForm.setValue('bankAccountCode', book.bankAccountCode);

    setSelectedBookId(book.id);
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
            ChequeBook Status
          </h1>
          {view === 'detail' && (
            <Button
              variant="ghost"
              onClick={() => setView('list')}
            >
              Back to List
            </Button>
          )}
        </div>
        <p className="text-sm text-slate-500">
          Acknowledge and process chequebooks allocated to your branch.
        </p>
      </div>

      {view === 'list' ? (
        /* List View of Dispatched Books */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-slate-800 text-sm">Dispatches</h3>
          </div>

          {dispatches.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-slate-500 mb-2">
                No dispatches found for this branch.
              </p>
              <Button
                onClick={() => {
                  setView('detail');
                  setQueryResults([]);
                }}
              >
                Go to ChequeBook Status Search
              </Button>
            </div>
          ) : (
            <ChequeBookAcknowledgementDispatchTable
              books={dispatches}
              onRowClick={handleRowClick}
              loading={isLoadingList || isFetchingList}
            />
          )}
        </div>
      ) : (
        /* Detailed / Process checklist View */
        <div className="space-y-6">
          {/* Filters panel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              ChequeBook
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <AsyncSelect
                  label="Status *"
                  placeholder="All"
                  value={selectedStatusOption}
                  loadOptions={loadStatusOptions}
                  defaultOptions={statusOptions}
                  onChange={option => {
                    const selectedOption = Array.isArray(option)
                      ? (option[0] ?? null)
                      : option;

                    setSearchStatus(
                      selectedOption?.value
                        ? (String(selectedOption.value) as ChequeBookStatus)
                        : ''
                    );
                    setSelectedBookId(null);
                  }}
                  isClearable
                  isSearchable
                  pagination={false}
                />
              </div>

              <FormProvider {...txnTypeForm}>
                <div>
                  <FormFieldSelect
                    name="bankAccountCode"
                    label="Bank Account Code"
                    placeholder="All"
                    loadOptions={async (inputValue: string, page = 1) => {
                      try {
                        const response = await accountProfileApi.getAccountProfiles({
                          page,
                          limit: ACCOUNT_PROFILE_OPTION_PAGE_SIZE,
                          search: inputValue,
                          active: true,
                        });
                        const bankAccounts = (response.data || []).filter(acc => {
                          return (
                            (acc.bankNature && acc.bankNature.value !== 'NONE') ||
                            (acc.accountType && acc.accountType.value === 'BANK LEDGER') ||
                            (acc.financialCode && acc.financialCode === 'BANKBL')
                          );
                        });
                        return {
                          options: bankAccounts.map(acc => ({
                            value: acc.id,
                            label: `${acc.accountCode} - ${acc.accountName}`,
                          })),
                          hasMore: (response.data || []).length === ACCOUNT_PROFILE_OPTION_PAGE_SIZE,
                        };
                      } catch {
                        return {
                          options: [],
                          hasMore: false,
                        };
                      }
                    }}
                    pagination
                    pageSize={ACCOUNT_PROFILE_OPTION_PAGE_SIZE}
                  />
                </div>

              </FormProvider>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleProcessQuery} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Process'}
              </Button>
            </div>
          </div>

          {/* Results Checklist table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-sm">
                Dispatches Checklist
              </h3>
            </div>

            {queryResults.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-slate-500">
                  No records found matching query criteria.
                </p>
              </div>
            ) : (
              <ChequeBookAcknowledgementChecklistTable
                books={queryResults}
                rowEdits={rowEdits}
                loading={isProcessing}
                onCheckboxChange={handleCheckboxChange}
                onRemarksChange={handleRemarksChange}
              />
            )}

            {queryResults.length > 0 && (
              <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-4">
                <Button onClick={handleSaveReviews} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChequeBookAcknowledgementPage;
