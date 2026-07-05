import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { manualBillBookApi } from '@/api';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  // Table rows
  const [rows, setRows] = useState<IAllocationRow[]>([]);
  const [hasProcessed, setHasProcessed] = useState(false);

  // Bulk allocate user
  const [bulkCashierId, setBulkCashierId] = useState('');

  useEffect(() => {
    const fetchOptions = async () => {
      if (!activeBranchId) return;
      try {
        setIsLoadingOptions(true);
        const data = await manualBillBookApi.getAuthorizedUsers(activeBranchId);
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
      toast.error('Please enter a valid Book range (From <= To).');
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
            transactionType: book.transactionType,
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 align-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Transaction Type</label>
            <select
              value={txnType}
              onChange={e => setTxnType(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="ALL">ALL</option>
              <option value="PB-RETAIL PURCHASE">PB-RETAIL PURCHASE</option>
              <option value="PS-RETAIL SALE">PS-RETAIL SALE</option>
              <option value="FB-BULK BUY">FB-BULK BUY</option>
              <option value="FS-BULK SALE">FS-BULK SALE</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Book No From</label>
            <input
              type="number"
              min="1"
              value={bookNoFromStr}
              onChange={e => setBookNoFromStr(e.target.value)}
              placeholder="e.g. 11"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Book No To</label>
            <input
              type="number"
              min="1"
              value={bookNoToStr}
              onChange={e => setBookNoToStr(e.target.value)}
              placeholder="e.g. 20"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleProcess}
            disabled={isProcessing}
            className="cursor-pointer inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 transition disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Process'}
          </button>
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
                        <input
                          type="checkbox"
                          checked={row.isCheck}
                          onChange={() => handleRowCheckbox(row.id)}
                          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4">
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
