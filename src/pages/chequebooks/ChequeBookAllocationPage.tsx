import { useCallback, useEffect, useRef, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/AuthContext';
import { chequebookApi } from '@/api';
import toast from 'react-hot-toast';
import { AsyncSelect, Button, Input, type AsyncSelectResponse } from '@/components/ui';
import { FormFieldSelect } from '@/components/forms';
import { accountProfileApi } from '@/api/accountProfile/accountProfile.api';
import { useListChequeBookCashiers } from '@/modules/chequebooks/hooks';
import { ChequeBookStatusEnum } from '@/modules/chequebooks/types';
import type { IChequeBook, IChequeBookAllocation } from '@/api';

const ACCOUNT_PROFILE_OPTION_PAGE_SIZE = 30;

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const formatRanges = (nums: number[]): string => {
  if (nums.length === 0) return '';
  const sorted = [...nums].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === prev + 1) {
      prev = sorted[i];
    } else {
      ranges.push(start === prev ? String(start) : `${start} - ${prev}`);
      start = sorted[i];
      prev = sorted[i];
    }
  }
  ranges.push(start === prev ? String(start) : `${start} - ${prev}`);
  return ranges.join(', ');
};

interface IAllocationRow {
  id: string;
  bookId: string;
  requestNo: string;
  requestDate: string;
  bankAccountCodeLabel: string;
  bookNoFrom: number;
  bookNoTo: number;
  mvNoFrom: number;
  mvNoTo: number;
  qty: number;
  hoRemarks: string;
  allocatedCashierId: string;
  remarks: string;
  isCheck: boolean;
  isAlreadyAssigned: boolean;
  assignedToCashierId: string;
}

const buildRows = (
  books: IChequeBook[],
  allocations: IChequeBookAllocation[],
  fromVal: number,
  toVal: number,
): IAllocationRow[] => {
  const rows: IAllocationRow[] = [];

  books.forEach(book => {
    const bookStart = Math.max(book.bookNoFrom, fromVal);
    const bookEnd = Math.min(book.bookNoTo, toVal);
    if (bookEnd < bookStart) return;

    const bookNoToCashierId = new Map<number, string>();
    for (const a of allocations) {
      if (a.checkBookId === book.id && a.bookNo >= bookStart && a.bookNo <= bookEnd) {
        bookNoToCashierId.set(a.bookNo, a.cashierId);
      }
    }

    const emitSegment = (from: number, to: number, cashierId: string | null) => {
      const totalBooks = to - from + 1;
      const totalQty = totalBooks * book.vouchersPerBook;
      const offsetFrom = from - book.bookNoFrom;
      const segMvNoFrom = book.mvNoFrom + offsetFrom * book.vouchersPerBook;
      const segMvNoTo = segMvNoFrom + totalQty - 1;
      const isAlreadyAssigned = cashierId !== null;

      rows.push({
        id: `${book.id}_${from}`,
        bookId: book.id,
        requestNo: book.no,
        requestDate: new Date(book.dispatchDate).toLocaleDateString() + ' 00:00:00',
        bankAccountCodeLabel: book.bankAccountCodeLabel || book.bankAccountCodeName || book.bankAccountCode || '-',
        bookNoFrom: from,
        bookNoTo: to,
        mvNoFrom: segMvNoFrom,
        mvNoTo: segMvNoTo,
        qty: totalQty,
        hoRemarks: book.remarks || '-',
        allocatedCashierId: '',
        remarks: '',
        isCheck: false,
        isAlreadyAssigned,
        assignedToCashierId: cashierId ?? '',
      });
    };

    let segFrom = bookStart;
    let segCashierId: string | null = bookNoToCashierId.get(bookStart) ?? null;

    for (let i = bookStart + 1; i <= bookEnd; i++) {
      const cur = bookNoToCashierId.get(i) ?? null;
      if (cur !== segCashierId) {
        emitSegment(segFrom, i - 1, segCashierId);
        segFrom = i;
        segCashierId = cur;
      }
    }
    emitSegment(segFrom, bookEnd, segCashierId);
  });

  return rows;
};

export const ChequeBookAllocationPage = () => {
  const { activeBranchId } = useAuth();
  const [searchParams] = useSearchParams();
  const bookId = searchParams.get('bookId');

  const txnTypeForm = useForm<{ bankAccountCode: string }>({
    defaultValues: { bankAccountCode: 'ALL' },
  });
  const watchedBankAccountCode = useWatch({ control: txnTypeForm.control, name: 'bankAccountCode' });

  const [bookNoFromStr, setBookNoFromStr] = useState('');
  const [bookNoToStr, setBookNoToStr] = useState('');

  const [rows, setRows] = useState<IAllocationRow[]>([]);
  const [existingAllocations, setExistingAllocations] = useState<IChequeBookAllocation[]>([]);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [allocatedWarning, setAllocatedWarning] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [bulkCashierId, setBulkCashierId] = useState('');

  const {
    data: cashiers = [],
    isLoading: isLoadingOptions,
    error: cashiersError,
  } = useListChequeBookCashiers(activeBranchId ?? null);

  const cashierOptions = cashiers.map(cashier => ({
    value: cashier.id,
    label: cashier.name,
  }));
  const loadCashierOptions = async (): Promise<AsyncSelectResponse> => ({
    options: cashierOptions,
    hasMore: false,
  });

  useEffect(() => {
    if (cashiersError) toast.error(getErrorMessage(cashiersError, 'Failed to load cashier list.'));
  }, [cashiersError]);

  const handleProcess = useCallback(async (
    overrideFrom?: number,
    overrideTo?: number,
    overrideBankAccountCode?: string,
  ) => {
    if (!activeBranchId) return;
    const fromVal = overrideFrom ?? parseInt(bookNoFromStr, 10);
    const toVal = overrideTo ?? parseInt(bookNoToStr, 10);
    const bankAccountCode = overrideBankAccountCode ?? watchedBankAccountCode ?? 'ALL';

    if (isNaN(fromVal) || isNaN(toVal) || fromVal < 1 || toVal < fromVal) {
      toast.error('Please enter a valid ChequeBook range (From <= To).');
      return;
    }

    try {
      setIsProcessing(true);
      setAllocatedWarning('');

      const data = await chequebookApi.findAll(activeBranchId, ChequeBookStatusEnum.APPROVE);
      const matched = data.filter(book => {
        if (bankAccountCode !== 'ALL' && book.bankAccountCode !== bankAccountCode) return false;
        return book.bookNoFrom <= toVal && book.bookNoTo >= fromVal;
      });

      const matchedIds = matched.map(b => b.id);
      const allocations = matchedIds.length > 0 ? await chequebookApi.getAllocations(matchedIds) : [];
      setExistingAllocations(allocations);

      const generatedRows = buildRows(matched, allocations, fromVal, toVal);
      setRows(generatedRows);
      setHasProcessed(true);

      const allAllocatedNos = allocations
        .filter(a => matchedIds.includes(a.checkBookId) && a.bookNo >= fromVal && a.bookNo <= toVal)
        .map(a => a.bookNo);
      setAllocatedWarning(allAllocatedNos.length > 0 ? formatRanges(allAllocatedNos) : '');

      const available = generatedRows.filter(r => !r.isAlreadyAssigned);
      if (available.length > 0) {
        toast.success(`Found ${available.length} available book range(s).`);
      } else if (generatedRows.length === 0) {
        toast.error('No matching approved chequebooks found in the specified range.');
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to search allocations.'));
    } finally {
      setIsProcessing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBranchId, bookNoFromStr, bookNoToStr, watchedBankAccountCode]);

  // Auto-populate and process when navigated from list view with bookId
  const autoProcessedRef = useRef(false);
  useEffect(() => {
    if (!bookId || !activeBranchId || autoProcessedRef.current) return;
    autoProcessedRef.current = true;

    chequebookApi.findById(bookId).then(book => {
      txnTypeForm.setValue('bankAccountCode', book.bankAccountCode ?? 'ALL');
      setBookNoFromStr(String(book.bookNoFrom));
      setBookNoToStr(String(book.bookNoTo));
      handleProcess(book.bookNoFrom, book.bookNoTo, book.bankAccountCode ?? 'ALL');
    }).catch(() => {
      toast.error('Failed to load cheque book details.');
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, activeBranchId]);

  const handleRowCheckbox = (rowId: string) =>
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, isCheck: !r.isCheck } : r));

  const handleHeaderCheckbox = (checked: boolean) =>
    setRows(prev => prev.map(r => r.isAlreadyAssigned ? r : { ...r, isCheck: checked }));

  const handleRowCashier = (rowId: string, cashierId: string) =>
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, allocatedCashierId: cashierId } : r));

  const handleRowRemarks = (rowId: string, val: string) =>
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, remarks: val } : r));

  const handleApplyBulkCashier = () => {
    if (!bulkCashierId) { toast.error('Please select a user first.'); return; }
    const checkedCount = rows.filter(r => r.isCheck).length;
    if (checkedCount === 0) { toast.error('No rows selected to allocate.'); return; }
    setRows(prev => prev.map(r => r.isCheck ? { ...r, allocatedCashierId: bulkCashierId } : r));
    toast.success(`Set user for ${checkedCount} selected rows.`);
  };

  const handleSaveAllocation = async () => {
    const checkedRows = rows.filter(r => r.isCheck);
    if (checkedRows.length === 0) { toast.error('Please select at least one row to allocate.'); return; }
    if (checkedRows.some(r => !r.allocatedCashierId)) {
      toast.error('Please select a user for all checked allocations.'); return;
    }

    try {
      setIsSaving(true);
      const payload: Array<{ checkBookId: string; bookNo: number; userId: string; remarks?: string }> = [];

      for (const r of checkedRows) {
        for (let i = r.bookNoFrom; i <= r.bookNoTo; i++) {
          const alreadyAssigned = existingAllocations.some(a => a.checkBookId === r.bookId && a.bookNo === i);
          if (alreadyAssigned) continue;
          payload.push({ checkBookId: r.bookId, bookNo: i, userId: r.allocatedCashierId, remarks: r.remarks || undefined });
        }
      }

      await chequebookApi.saveAllocations(payload.map(p => ({ ...p, userId: p.userId })));
      toast.success('Chequebook page allocations saved successfully.');
      await handleProcess();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to save allocations.'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!activeBranchId) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-slate-500 font-medium">Please select your active branch workplace to proceed.</p>
      </div>
    );
  }

  const availableRows = rows.filter(r => !r.isAlreadyAssigned);
  const allChecked = availableRows.length > 0 && availableRows.every(r => r.isCheck);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">ChequeBook Allocation</h1>
        <p className="text-sm text-slate-500">Allocate individual chequebook pages to users at your branch.</p>
      </div>

      {/* Query Filter box */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
          ChequeBook
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <FormProvider {...txnTypeForm}>
            <div>
              <FormFieldSelect
                name="bankAccountCode"
                label="Bank Account Code"
                placeholder="ALL"
                loadOptions={async (inputValue: string, page = 1) => {
                  try {
                    const response = await accountProfileApi.getAccountProfiles({
                      page, limit: ACCOUNT_PROFILE_OPTION_PAGE_SIZE, search: inputValue, active: true,
                    });
                    const bankAccounts = (response.data || []).filter(acc =>
                      (acc.bankNature && acc.bankNature.value !== 'NONE') ||
                      (acc.accountType && acc.accountType.value === 'BANK LEDGER') ||
                      (acc.financialCode && acc.financialCode === 'BANKBL')
                    );
                    return {
                      options: bankAccounts.map(acc => ({ value: acc.id, label: `${acc.accountCode} - ${acc.accountName}` })),
                      hasMore: (response.data || []).length === ACCOUNT_PROFILE_OPTION_PAGE_SIZE,
                    };
                  } catch { return { options: [], hasMore: false }; }
                }}
                pagination
                pageSize={ACCOUNT_PROFILE_OPTION_PAGE_SIZE}
              />
            </div>
          </FormProvider>

          <div>
            <Input
              type="number" label="Check Book No. From" min="1"
              value={bookNoFromStr} onChange={e => setBookNoFromStr(e.target.value)}
              placeholder="e.g. 11" valueTransform="none" classes={{ container: 'max-w-none' }}
            />
          </div>
          <div>
            <Input
              type="number" label="Check Book No. To" min="1"
              value={bookNoToStr} onChange={e => setBookNoToStr(e.target.value)}
              placeholder="e.g. 20" valueTransform="none" classes={{ container: 'max-w-none' }}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={() => handleProcess()} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Process'}
          </Button>
        </div>
      </div>

      {/* Allocated warning banner */}
      {hasProcessed && allocatedWarning && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 flex items-start gap-3">
          <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Book range <span className="font-mono">{allocatedWarning}</span> already assigned.
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              The table below shows all ranges — already assigned rows are read-only.
            </p>
          </div>
        </div>
      )}

      {/* Allocation Checklist Section */}
      {hasProcessed && rows.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50">
            <h3 className="font-semibold text-slate-800 text-sm">Dispatches Checklist</h3>

            {availableRows.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-600">Allocate User:</span>
                {isLoadingOptions ? (
                  <span className="text-xs text-slate-500">Loading...</span>
                ) : (
                  <select
                    value={bulkCashierId}
                    onChange={e => setBulkCashierId(e.target.value)}
                    className="rounded border border-slate-300 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                  >
                    <option value="">Select User</option>
                    {cashiers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                )}
                <button
                  onClick={handleApplyBulkCashier}
                  variant="outline"
                  size="sm"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 font-medium select-none text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-center">
                    <input
                      type="checkbox" checked={allChecked}
                      onChange={e => handleHeaderCheckbox(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3">Allocate User</th>
                  <th className="px-4 py-3">Remarks</th>
                  <th className="px-4 py-3">Request No</th>
                  <th className="px-4 py-3">Request Date</th>
                  <th className="px-4 py-3">Bank Account</th>
                  <th className="px-4 py-3">Book No Range</th>
                  <th className="px-4 py-3">Cheque No From</th>
                  <th className="px-4 py-3">Cheque No To</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">HO Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 align-middle">
                {rows.map(row => (
                  <tr
                    key={row.id}
                    className={`transition ${row.isAlreadyAssigned ? 'bg-slate-50 text-slate-400' : 'hover:bg-slate-50/70'}`}
                  >
                    <td className="px-4 py-4 text-center">
                      {!row.isAlreadyAssigned && (
                        <input
                          type="checkbox" checked={row.isCheck}
                          onChange={() => handleRowCheckbox(row.id)}
                          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                        />
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {row.isAlreadyAssigned ? (
                        <span className="text-xs font-medium text-slate-600">
                          {cashiers.find(c => c.id === row.assignedToCashierId)?.name || row.assignedToCashierId || '—'}
                        </span>
                      ) : (
                        <select
                          value={row.allocatedCashierId}
                          onChange={e => handleRowCashier(row.id, e.target.value)}
                          className="rounded border border-slate-300 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 w-32"
                        >
                          <option value="">Select User</option>
                          {cashiers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {!row.isAlreadyAssigned && (
                        <textarea
                          rows={1} value={row.remarks}
                          onChange={e => handleRowRemarks(row.id, e.target.value)}
                          placeholder="Note..."
                          className="w-full min-w-[120px] rounded border border-slate-300 px-2 py-1 text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none"
                        />
                      )}
                    </td>
                    <td className="px-4 py-4 font-mono font-semibold text-slate-900">{row.requestNo}</td>
                    <td className="px-4 py-4 text-xs whitespace-nowrap">{row.requestDate}</td>
                    <td className="px-4 py-4 text-xs">{row.bankAccountCodeLabel}</td>
                    <td className="px-4 py-4 font-semibold text-slate-800">
                      {row.bookNoFrom === row.bookNoTo ? row.bookNoFrom : `${row.bookNoFrom} - ${row.bookNoTo}`}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs">{row.mvNoFrom}</td>
                    <td className="px-4 py-4 font-mono text-xs">{row.mvNoTo}</td>
                    <td className="px-4 py-4">{row.qty}</td>
                    <td className="px-4 py-4 text-xs max-w-[120px] truncate" title={row.hoRemarks}>{row.hoRemarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {availableRows.length > 0 && (
            <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={handleSaveAllocation} disabled={isSaving}
                className="cursor-pointer inline-flex items-center justify-center rounded-md bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 transition disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
      )}

      {hasProcessed && rows.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-slate-500">No books found in the specified range to allocate.</p>
        </div>
      )}
    </div>
  );
};

export default ChequeBookAllocationPage;
