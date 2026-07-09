import { useEffect, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useAuth } from '@/lib/AuthContext';
import toast from 'react-hot-toast';
import { Button, Input } from '@/components/ui';
import { FormFieldSelect } from '@/components/forms';
import { accountProfileApi } from '@/api/accountProfile/accountProfile.api';
import {
  ChequeBookAllocationTable,
  type IAllocationRow,
} from '@/modules/chequebooks/components';
import {
  useListChequeBookCashiers,
  useProcessChequeBookAllocations,
  useSaveChequeBookAllocations,
} from '@/modules/chequebooks/hooks';

const ACCOUNT_PROFILE_OPTION_PAGE_SIZE = 30;

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const ChequeBookAllocationPage = () => {
  const { activeBranchId } = useAuth();

  const txnTypeForm = useForm<{
    bankAccountCode: string;
  }>({
    defaultValues: {
      bankAccountCode: 'ALL',
    },
  });

  const watchedBankAccountCode = useWatch({
    control: txnTypeForm.control,
    name: 'bankAccountCode',
  });

  // Filters
  const [bookNoFromStr, setBookNoFromStr] = useState('');
  const [bookNoToStr, setBookNoToStr] = useState('');

  // Table rows
  const [rows, setRows] = useState<IAllocationRow[]>([]);
  const [hasProcessed, setHasProcessed] = useState(false);

  // Bulk allocate cashier
  const [bulkCashierId, setBulkCashierId] = useState('');

  const {
    data: cashiers = [],
    isLoading: isLoadingOptions,
    error: cashiersError,
  } = useListChequeBookCashiers(activeBranchId ?? null);
  const { processAllocations, isProcessing } =
    useProcessChequeBookAllocations();
  const { saveAllocations, isSaving } = useSaveChequeBookAllocations();

  useEffect(() => {
    if (cashiersError) {
      toast.error(
        getErrorMessage(cashiersError, 'Failed to load cashier list.')
      );
    }
  }, [cashiersError]);

  const handleProcess = async () => {
    if (!activeBranchId) return;
    const fromVal = parseInt(bookNoFromStr, 10);
    const toVal = parseInt(bookNoToStr, 10);

    if (isNaN(fromVal) || isNaN(toVal) || fromVal < 1 || toVal < fromVal) {
      toast.error('Please enter a valid ChequeBook range (From <= To).');
      return;
    }

    try {
      const generatedRows = await processAllocations({
        branchId: activeBranchId,
        bankAccountCode: watchedBankAccountCode || 'ALL',
        fromVal,
        toVal,
      });

      setRows(generatedRows);
      setHasProcessed(true);
      if (generatedRows.length === 0) {
        toast.error(
          'No matching approved chequebooks found in the specified range.'
        );
      } else {
        toast.success(`Found ${generatedRows.length} chequebooks.`);
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to search allocations.'));
    }
  };

  const handleRowCheckbox = (rowId: string) => {
    setRows(prev =>
      prev.map(r => (r.id === rowId ? { ...r, isCheck: !r.isCheck } : r))
    );
  };

  const handleHeaderCheckbox = (checked: boolean) => {
    setRows(prev => prev.map(r => ({ ...r, isCheck: checked })));
  };

  const handleRowCashier = (rowId: string, cashierId: string) => {
    setRows(prev =>
      prev.map(r =>
        r.id === rowId ? { ...r, allocatedCashierId: cashierId } : r
      )
    );
  };

  const handleRowRemarks = (rowId: string, val: string) => {
    setRows(prev =>
      prev.map(r => (r.id === rowId ? { ...r, remarks: val } : r))
    );
  };

  const handleApplyBulkCashier = () => {
    if (!bulkCashierId) {
      toast.error('Please select a user first.');
      return;
    }
    const checkedCount = rows.filter(r => r.isCheck).length;
    if (checkedCount === 0) {
      toast.error('No rows selected to allocate.');
      return;
    }
    setRows(prev =>
      prev.map(r =>
        r.isCheck ? { ...r, allocatedCashierId: bulkCashierId } : r
      )
    );
    toast.success(`Set user for ${checkedCount} selected rows.`);
  };

  const handleSaveAllocation = async () => {
    const checkedRows = rows.filter(r => r.isCheck);
    if (checkedRows.length === 0) {
      toast.error('Please select at least one row to allocate.');
      return;
    }
    const invalidRows = checkedRows.filter(r => !r.allocatedCashierId);
    if (invalidRows.length > 0) {
      toast.error('Please select a user for all checked allocations.');
      return;
    }

    try {
      const payload = checkedRows.map(r => ({
        checkBookId: r.bookId,
        bookNo: r.bookNo,
        cashierId: r.allocatedCashierId,
        remarks: r.remarks || undefined,
      }));

      await saveAllocations(payload);

      // Reload values
      await handleProcess();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to save allocations.'));
    }
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

  const allChecked = rows.length > 0 && rows.every(r => r.isCheck);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          ChequeBook Allocation
        </h1>
        <p className="text-sm text-slate-500">
          Allocate individual chequebook pages to users at your branch.
        </p>
      </div>

      {/* Query Filter box */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
          ChequeBook
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 align-end">
          <FormProvider {...txnTypeForm}>
            <div>
              <FormFieldSelect
                name="bankAccountCode"
                label="Bank Account Code"
                placeholder="ALL"
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

          <div>
            <Input
              type="number"
              label="Check Book No. From"
              min="1"
              value={bookNoFromStr}
              onChange={e => setBookNoFromStr(e.target.value)}
              placeholder="e.g. 11"
              valueTransform="none"
              classes={{ container: 'max-w-none' }}
            />
          </div>

          <div>
            <Input
              type="number"
              label="Check Book No. To"
              min="1"
              value={bookNoToStr}
              onChange={e => setBookNoToStr(e.target.value)}
              placeholder="e.g. 20"
              valueTransform="none"
              classes={{ container: 'max-w-none' }}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={handleProcess} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Process'}
          </Button>
        </div>
      </div>

      {/* Allocation Checklist Section */}
      {hasProcessed && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-sm">
                Dispatches Checklist
              </h3>

            {/* Bulk Assign Cashier Control */}
            {rows.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-600">
                  Allocate User:
                </span>
                {isLoadingOptions ? (
                  <span className="text-xs text-slate-500">Loading...</span>
                ) : (
                  <select
                    value={bulkCashierId}
                    onChange={e => setBulkCashierId(e.target.value)}
                    className="rounded border border-slate-300 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                  >
                    <option value="">Select User</option>
                    {cashiers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
                <Button
                  onClick={handleApplyBulkCashier}
                  className="cursor-pointer rounded bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1 text-xs font-semibold shadow-sm transition"
                >
                  Apply
                </Button>
              </div>
            )}
          </div>

          {rows.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-500">
                No books found in the specified range to allocate.
              </p>
            </div>
          ) : (
            <ChequeBookAllocationTable
              rows={rows}
              cashiers={cashiers}
              loading={isLoadingOptions}
              allChecked={allChecked}
              onHeaderCheckboxChange={handleHeaderCheckbox}
              onRowCheckboxChange={handleRowCheckbox}
              onRowCashierChange={handleRowCashier}
              onRowRemarksChange={handleRowRemarks}
            />
          )}

          {rows.length > 0 && (
            <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <Button
                onClick={handleSaveAllocation}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChequeBookAllocationPage;
