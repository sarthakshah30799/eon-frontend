import { useState, useEffect, useRef } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { manualBillBookApi } from '@/api';
import { categoryOptionsApi } from '@/api/categoryOptions/categoryOptions.api';
import { Button, Input, AsyncSelect, type AsyncSelectOption } from '@/components/ui';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import type { MultiValue, SingleValue } from 'react-select';
import toast from 'react-hot-toast';
import { ManualBillBookStatusEnum } from '@/modules/manual-bill-books/types';

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
      if (start === prev) {
        ranges.push(String(start));
      } else {
        ranges.push(`${start} - ${prev}`);
      }
      start = sorted[i];
      prev = sorted[i];
    }
  }

  if (start === prev) {
    ranges.push(String(start));
  } else {
    ranges.push(`${start} - ${prev}`);
  }

  return ranges.join(', ');
};

interface IAllocationRow {
  id: string; // generated unique id
  bookId: string; // original manual book id
  requestNo: string;
  requestDate: string;
  transactionType: string;
  bookNoFrom: number;
  bookNoTo: number;
  mvNoFrom: number;
  mvNoTo: number;
  qty: number;
  hoRemarks: string;
  // Allocation state
  allocatedCashierId: string; // holds the user id
  remarks: string;
  isCheck: boolean;
  // Already assigned info (from manual_book_page_tracking)
  isAlreadyAssigned: boolean;
  assignedToUserName: string;   // cashier / delivery boy receiving the books
  assignedByUserName: string;   // manager who made the assignment
}

export const ManagerToCashierAllocationPage = () => {
  const { activeBranchId } = useAuth();
  const [searchParams] = useSearchParams();
  const bookId = searchParams.get('bookId');
  const isAutoProcessedRef = useRef(false);
  
  // Filters
  const [txnType, setTxnType] = useState('ALL');
  const [bookNoFromStr, setBookNoFromStr] = useState('');
  const [bookNoToStr, setBookNoToStr] = useState('');
  
  // Options
  const [cashiers, setCashiers] = useState<Array<{ id: string; name: string }>>([]);
  const [txnTypes, setTxnTypes] = useState<Array<{ id: string; label: string }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  // Table rows
  const [rows, setRows] = useState<IAllocationRow[]>([]);
  const [existingAllocations, setExistingAllocations] = useState<any[]>([]);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [allocatedWarning, setAllocatedWarning] = useState<string>('');

  // Bulk allocate user
  const [bulkCashierId, setBulkCashierId] = useState('');

  useEffect(() => {
    const fetchTxnTypes = async () => {
      try {
        const options = await categoryOptionsApi.getCategoryOptionsByCode(CategoryOptionCodeEnum.Transaction);
        setTxnTypes(options.map(o => ({ id: o.value, label: o.label })));
      } catch (err) {
        console.error('Failed to load transaction types', err);
      }
    };
    fetchTxnTypes();
  }, []);

  useEffect(() => {
    const fetchOptions = async () => {
      if (!activeBranchId) return;
      try {
        setIsLoadingOptions(true);
        console.log('[DEBUG] manual allocation fetch users', {
          activeBranchId,
        });
        const data = await manualBillBookApi.getAuthorizedUsers();
        console.log('[DEBUG] manual allocation users response', data);
        setCashiers(data);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to load user list.');
      } finally {
        setIsLoadingOptions(false);
      }
    };
    fetchOptions();
  }, [activeBranchId]);

  useEffect(() => {
    const prefillFromBook = async () => {
      if (bookId && activeBranchId && !isAutoProcessedRef.current) {
        isAutoProcessedRef.current = true;
        try {
          setIsProcessing(true);
          const data = await manualBillBookApi.findAll(activeBranchId, ManualBillBookStatusEnum.APPROVED);
          const book = data.find(b => b.id === bookId);
          if (book) {
            // Only pre-fill the form fields — do NOT render the table yet.
            // The user must click Process to see the Dispatches Checklist.
            setTxnType(book.transactionType);
            setBookNoFromStr(String(book.bookNoFrom));
            setBookNoToStr(String(book.bookNoTo));
          }
        } catch (err: unknown) {
          console.error('Failed to pre-fill book details:', err);
        } finally {
          setIsProcessing(false);
        }
      }
    };
    prefillFromBook();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, activeBranchId]);

  const handleProcess = async () => {
    if (!activeBranchId) return;
    const fromVal = parseInt(bookNoFromStr, 10);
    const toVal = parseInt(bookNoToStr, 10);

    if (isNaN(fromVal) || isNaN(toVal) || fromVal < 1 || toVal < fromVal) {
      toast.error("Please enter a valid book range (Book No From must be less than or equal to Book No To).");
      return;
    }

    try {
      setIsProcessing(true);
      setAllocatedWarning('');
      // Fetch all dispatches for the branch (to query approved allocations)
      const data = await manualBillBookApi.findAll(activeBranchId, ManualBillBookStatusEnum.APPROVED);
      
      // Filter by range and txnType in memory
      const matched = data.filter(book => {
        if (txnType !== 'ALL' && book.transactionType !== txnType) {
          return false;
        }
        // Check overlap of range
        return book.bookNoFrom <= toVal && book.bookNoTo >= fromVal;
      });

      const matchedIds = matched.map(b => b.id);
      const allocations = matchedIds.length > 0 
        ? await manualBillBookApi.getAllocations(matchedIds)
        : [];
      setExistingAllocations(allocations);

      // Build all contiguous segments (allocated + unallocated) for each matched book
      const generatedRows: IAllocationRow[] = [];
      const allAllocatedNos: number[] = [];

      matched.forEach(book => {
        const bookStart = Math.max(book.bookNoFrom, fromVal);
        const bookEnd = Math.min(book.bookNoTo, toVal);
        if (bookEnd < bookStart) return;

        // Build bookNo → { cashierId, cashierName, assignedByName } map for this range
        const bookNoToUser = new Map<number, string>();
        const bookNoToCashierName = new Map<number, string>();
        const bookNoToAssignedByName = new Map<number, string>();
        for (const a of allocations) {
          if (a.manualBookId === book.id && a.bookNo >= bookStart && a.bookNo <= bookEnd) {
            bookNoToUser.set(a.bookNo, a.cashierId);
            if (a.cashierName) bookNoToCashierName.set(a.bookNo, a.cashierName);
            if (a.assignedByName) bookNoToAssignedByName.set(a.bookNo, a.assignedByName);
            allAllocatedNos.push(a.bookNo);
          }
        }

        // Helper to emit one row segment
        const emitSegment = (from: number, to: number, cashierId: string | null) => {
          const totalBooks = to - from + 1;
          const totalQty = totalBooks * book.vouchersPerBook;
          const offsetFrom = from - book.bookNoFrom;
          const startMvNo = book.mvNoFrom + offsetFrom * book.vouchersPerBook;
          const endMvNo = startMvNo + totalQty - 1;
          const isAlreadyAssigned = cashierId !== null;
          const cashierName = bookNoToCashierName.get(from) ?? '';
          const assignedByName = bookNoToAssignedByName.get(from) ?? '';

          generatedRows.push({
            id: `${book.id}_${from}`,
            bookId: book.id,
            requestNo: book.no,
            requestDate: new Date(book.dispatchDate).toLocaleDateString() + ' 00:00:00',
            transactionType: book.transactionTypeLabel || book.transactionType,
            bookNoFrom: from,
            bookNoTo: to,
            mvNoFrom: startMvNo,
            mvNoTo: endMvNo,
            qty: totalQty,
            hoRemarks: book.remarks || '-',
            allocatedCashierId: '',
            remarks: '',
            isCheck: false,
            isAlreadyAssigned,
            assignedToUserName: isAlreadyAssigned ? cashierName : '',
            assignedByUserName: isAlreadyAssigned ? assignedByName : '',
          });
        };

        // Group into contiguous segments with same cashierId (or null for unallocated)
        let segFrom = bookStart;
        let segCashierId: string | null = bookNoToUser.get(bookStart) ?? null;

        for (let i = bookStart + 1; i <= bookEnd; i++) {
          const cur = bookNoToUser.get(i) ?? null;
          if (cur !== segCashierId) {
            emitSegment(segFrom, i - 1, segCashierId);
            segFrom = i;
            segCashierId = cur;
          }
        }
        emitSegment(segFrom, bookEnd, segCashierId);
      });

      setRows(generatedRows);
      setHasProcessed(true);

      const allAllocatedMsg = allAllocatedNos.length > 0 ? formatRanges(allAllocatedNos) : '';
      setAllocatedWarning(allAllocatedMsg);

      const availableRows = generatedRows.filter(r => !r.isAlreadyAssigned);
      if (availableRows.length > 0) {
        toast.success(`Found ${availableRows.length} available book range(s).`);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to search allocations.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRowCheckbox = (rowId: string) => {
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, isCheck: !r.isCheck } : r));
  };

  const handleHeaderCheckbox = (checked: boolean) => {
    setRows(prev => prev.map(r => r.isAlreadyAssigned ? r : { ...r, isCheck: checked }));
  };

  const handleRowCashier = (rowId: string, cashierId: string) => {
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, allocatedCashierId: cashierId } : r));
  };

  const handleRowRemarks = (rowId: string, val: string) => {
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, remarks: val } : r));
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
    setRows(prev => prev.map(r => r.isCheck ? { ...r, allocatedCashierId: bulkCashierId } : r));
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
      setIsSaving(true);
      const payload: any[] = [];
      for (const r of checkedRows) {
        for (let i = r.bookNoFrom; i <= r.bookNoTo; i++) {
          const alreadyAssigned = existingAllocations.some(
            a => a.manualBookId === r.bookId && a.bookNo === i
          );
          if (alreadyAssigned) {
            continue;
          }
          payload.push({
            manualBookId: r.bookId,
            bookNo: i,
            userId: r.allocatedCashierId,
            remarks: r.remarks || undefined,
          });
        }
      }

      await manualBillBookApi.saveAllocations(payload);
      toast.success('Manager to User page allocations saved successfully.');
      
      // Reload values
      await handleProcess();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save allocations.');
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
  const selectedTxnType = txnTypes.find(t => t.id === txnType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manual Bill Book Allocation</h1>
        <p className="text-sm text-slate-500">
          Allocate individual manual bill book pages to users at your branch.
        </p>
      </div>

      {/* Query Filter box */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
          Manual Bill
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <AsyncSelect
              key={txnTypes.length}
              label="Transaction Type"
              placeholder="Select Type"
              value={
                txnType === 'ALL'
                  ? { value: 'ALL', label: 'ALL' }
                  : selectedTxnType
                    ? { value: txnType, label: selectedTxnType.label }
                    : null
              }
              onChange={(
                option: MultiValue<AsyncSelectOption> | SingleValue<AsyncSelectOption>
              ) => {
                const selectedOption = Array.isArray(option)
                  ? option[0] ?? null
                  : option;

                setTxnType(
                  selectedOption?.value
                    ? String(selectedOption.value)
                    : 'ALL'
                );
              }}
              loadOptions={async () => ({
                options: [
                  { value: 'ALL', label: 'ALL' },
                  ...txnTypes.map(t => ({ value: t.id, label: t.label }))
                ],
                hasMore: false
              })}
              isClearable={false}
            />
          </div>

          <div>
            <Input
              type="number"
              label="Book No From"
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
              label="Book No To"
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

      {/* Allocated warning banner */}
      {hasProcessed && allocatedWarning && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 flex items-start gap-3">
          <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Book range <span className="font-mono">{allocatedWarning}</span> already assigned.
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Please change your range — the table below shows only the available unassigned books.
            </p>
          </div>
        </div>
      )}

      {/* Allocation Checklist Section */}
      {hasProcessed && rows.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50">
            <h3 className="font-semibold text-slate-800 text-sm">Dispatches Checklist</h3>
            
            {/* Bulk Assign Cashier Control */}
            {rows.length > 0 && (
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
                    {cashiers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}
                <button
                  onClick={handleApplyBulkCashier}
                  className="cursor-pointer rounded bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1 text-xs font-semibold shadow-sm transition"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {rows.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-500">No books found in the specified range to allocate.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 font-medium select-none">
                    <th className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={e => handleHeaderCheckbox(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3">Allocate User</th>
                    <th className="px-4 py-3">Remarks</th>
                    <th className="px-4 py-3">Request No</th>
                    <th className="px-4 py-3">Request Date</th>
                    <th className="px-4 py-3">Transaction Type</th>
                    <th className="px-4 py-3">Book No Range</th>
                    <th className="px-4 py-3">Assigned By</th>
                    <th className="px-4 py-3">MV No From</th>
                    <th className="px-4 py-3">MV No TO</th>
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
                            type="checkbox"
                            checked={row.isCheck}
                            onChange={() => handleRowCheckbox(row.id)}
                            className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                          />
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {row.isAlreadyAssigned ? (
                          <span className="text-xs font-medium text-slate-600">{row.assignedToUserName || '—'}</span>
                        ) : (
                          <select
                            value={row.allocatedCashierId}
                            onChange={e => handleRowCashier(row.id, e.target.value)}
                            className="rounded border border-slate-300 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 w-32"
                          >
                            <option value="">Select User</option>
                            {cashiers.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {!row.isAlreadyAssigned && (
                          <textarea
                            rows={1}
                            value={row.remarks}
                            onChange={e => handleRowRemarks(row.id, e.target.value)}
                            placeholder="Note..."
                            className="w-full min-w-[120px] rounded border border-slate-300 px-2 py-1 text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none"
                          />
                        )}
                      </td>
                      <td className="px-4 py-4 font-mono font-semibold text-slate-900">{row.requestNo}</td>
                      <td className="px-4 py-4 text-xs whitespace-nowrap">{row.requestDate}</td>
                      <td className="px-4 py-4 text-xs">{row.transactionType}</td>
                      <td className="px-4 py-4 font-semibold text-slate-800">
                        {row.bookNoFrom} - {row.bookNoTo}
                      </td>
                      <td className="px-4 py-4 text-xs font-medium">
                        {row.isAlreadyAssigned && row.assignedByUserName
                          ? <span className="text-slate-600">{row.assignedByUserName}</span>
                          : <span className="text-slate-400">—</span>
                        }
                      </td>
                      <td className="px-4 py-4 font-mono text-xs">{row.mvNoFrom}</td>
                      <td className="px-4 py-4 font-mono text-xs">{row.mvNoTo}</td>
                      <td className="px-4 py-4">{row.qty}</td>
                      <td className="px-4 py-4 text-xs max-w-[120px] truncate" title={row.hoRemarks}>
                        {row.hoRemarks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {availableRows.length > 0 && (
            <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={handleSaveAllocation}
                disabled={isSaving}
                className="cursor-pointer inline-flex items-center justify-center rounded-md bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 transition disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManagerToCashierAllocationPage;
