import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { manualBillBookApi } from '@/api';
import { categoryOptionsApi } from '@/api/categoryOptions/categoryOptions.api';
import {
  AsyncSelect,
  Button,
  Checkbox,
  Input,
  type AsyncSelectOption,
  type AsyncSelectResponse,
} from '@/components/ui';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import type { MultiValue, SingleValue } from 'react-select';
import toast from 'react-hot-toast';

interface IAllocationRow {
  id: string; // generated unique id
  bookId: string; // original manual book id
  requestNo: string;
  requestDate: string;
  transactionType: string;
  bookNo: number;
  mvNoFrom: number;
  mvNoTo: number;
  qty: number;
  hoRemarks: string;
  // Allocation state
  allocatedCashierId: string; // holds the user id
  remarks: string;
  isCheck: boolean;
}

export const ManagerToCashierAllocationPage = () => {
  const { activeBranchId } = useAuth();
  
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
  const [hasProcessed, setHasProcessed] = useState(false);

  // Bulk allocate user
  const [bulkCashierId, setBulkCashierId] = useState('');

  const cashierOptions = cashiers.map(cashier => ({
    value: cashier.id,
    label: cashier.name,
  }));
  const loadCashierOptions = async (): Promise<AsyncSelectResponse> => ({
    options: cashierOptions,
    hasMore: false,
  });

  useEffect(() => {
    const fetchTxnTypes = async () => {
      try {
        const options = await categoryOptionsApi.getCategoryOptionsByCode(CategoryOptionCodeEnum.Transaction);
        setTxnTypes(options.map(o => ({ id: o.id, label: o.label })));
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
      // Fetch all dispatches for the branch (to query approved allocations)
      const data = await manualBillBookApi.findAll(activeBranchId, 'Approved');
      
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

      // Split ranges into individual books
      const generatedRows: IAllocationRow[] = [];
      matched.forEach(book => {
        const start = Math.max(book.bookNoFrom, fromVal);
        const end = Math.min(book.bookNoTo, toVal);

        for (let i = start; i <= end; i++) {
          const offset = i - book.bookNoFrom;
          const bookMvNoFrom = book.mvNoFrom + offset * book.vouchersPerBook;
          const bookMvNoTo = bookMvNoFrom + book.vouchersPerBook - 1;

          const existing = allocations.find(
            a => a.manualBookId === book.id && a.bookNo === i
          );

          generatedRows.push({
            id: `${book.id}-${i}`,
            bookId: book.id,
            requestNo: book.no,
            requestDate: new Date(book.dispatchDate).toLocaleDateString() + ' 00:00:00',
            transactionType: book.transactionTypeLabel || book.transactionType,
            bookNo: i,
            mvNoFrom: bookMvNoFrom,
            mvNoTo: bookMvNoTo,
            qty: book.vouchersPerBook,
            hoRemarks: book.remarks || '-',
            allocatedCashierId: existing ? existing.cashierId : '',
            remarks: existing ? existing.remarks || '' : '',
            isCheck: false,
          });
        }
      });

      setRows(generatedRows);
      setHasProcessed(true);
      if (generatedRows.length === 0) {
        toast.error('No matching approved manual bill books found in the specified range.');
      } else {
        toast.success(`Found ${generatedRows.length} books.`);
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
    setRows(prev => prev.map(r => ({ ...r, isCheck: checked })));
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
      const payload = checkedRows.map(r => ({
        manualBookId: r.bookId,
        bookNo: r.bookNo,
        userId: r.allocatedCashierId,
        remarks: r.remarks || undefined,
      }));

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

  const allChecked = rows.length > 0 && rows.every(r => r.isCheck);
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

      {/* Allocation Checklist Section */}
      {hasProcessed && (
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
                  <AsyncSelect
                    value={
                      cashierOptions.find(option => option.value === bulkCashierId) ??
                      null
                    }
                    onChange={option => {
                      const nextOption = Array.isArray(option) ? option[0] : option;
                      setBulkCashierId(nextOption ? String(nextOption.value) : '');
                    }}
                    loadOptions={loadCashierOptions}
                    placeholder="Select User"
                    isSearchable={false}
                    className="w-40"
                  />
                )}
                <Button
                  type="button"
                  onClick={handleApplyBulkCashier}
                  variant="outline"
                  size="sm"
                >
                  Apply
                </Button>
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
                      <Checkbox
                        checked={allChecked}
                        onChange={checked => handleHeaderCheckbox(checked)}
                      />
                    </th>
                    <th className="px-4 py-3">Allocate User</th>
                    <th className="px-4 py-3">Remarks</th>
                    <th className="px-4 py-3">Request No</th>
                    <th className="px-4 py-3">Request Date</th>
                    <th className="px-4 py-3">Transaction Type</th>
                    <th className="px-4 py-3">Book No</th>
                    <th className="px-4 py-3">MV No From</th>
                    <th className="px-4 py-3">MV No TO</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">HO Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 align-middle">
                  {rows.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-4 text-center">
                        <Checkbox
                          checked={row.isCheck}
                          onChange={() => handleRowCheckbox(row.id)}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <AsyncSelect
                          value={
                            cashierOptions.find(
                              option => option.value === row.allocatedCashierId
                            ) ?? null
                          }
                          onChange={option => {
                            const nextOption = Array.isArray(option) ? option[0] : option;
                            handleRowCashier(
                              row.id,
                              nextOption ? String(nextOption.value) : ''
                            );
                          }}
                          loadOptions={loadCashierOptions}
                          placeholder="Select User"
                          isSearchable={false}
                          className="w-32"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <textarea
                          rows={1}
                          value={row.remarks}
                          onChange={e => handleRowRemarks(row.id, e.target.value)}
                          placeholder="Note..."
                          className="w-full min-w-[120px] rounded border border-slate-300 px-2 py-1 text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none"
                        />
                      </td>
                      <td className="px-4 py-4 font-mono font-semibold text-slate-900">{row.requestNo}</td>
                      <td className="px-4 py-4 text-xs whitespace-nowrap">{row.requestDate}</td>
                      <td className="px-4 py-4 text-xs">{row.transactionType}</td>
                      <td className="px-4 py-4 font-semibold text-slate-800">{row.bookNo}</td>
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

          {rows.length > 0 && (
            <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <Button
                type="button"
                onClick={handleSaveAllocation}
                disabled={isSaving}
                variant="default"
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

export default ManagerToCashierAllocationPage;
