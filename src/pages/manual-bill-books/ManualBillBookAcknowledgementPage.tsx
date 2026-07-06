import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { manualBillBookApi, type IManualBook } from '@/api';
import { categoryOptionsApi } from '@/api/categoryOptions/categoryOptions.api';
import { Loader } from '@/components/ui/loader';
import { Button, AsyncSelect, DatePicker, type AsyncSelectOption } from '@/components/ui';
import type { MultiValue, SingleValue } from 'react-select';
import toast from 'react-hot-toast';

export const ManualBillBookAcknowledgementPage = () => {
  const { activeBranchId } = useAuth();
  
  // Navigation: 'list' | 'detail'
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [dispatches, setDispatches] = useState<IManualBook[]>([]);

  // Filter states for Detail View
  const [searchStatus, setSearchStatus] = useState('Pending');
  const [searchTxnType, setSearchTxnType] = useState('ALL');
  const [txnTypes, setTxnTypes] = useState<Array<{ id: string; label: string }>>([]);

  useEffect(() => {
    const fetchTxnTypes = async () => {
      try {
        const options = await categoryOptionsApi.getCategoryOptionsByCode('TRANSACTION');
        setTxnTypes(options.map(o => ({ id: o.id, label: o.label })));
      } catch (err) {
        console.error('Failed to load transaction types', err);
      }
    };
    fetchTxnTypes();
  }, []);
  
  // Default dates: From 30 days ago to Today
  const getPastDateStr = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  };
  const [fromDate, setFromDate] = useState(getPastDateStr(30));
  const [toDate, setToDate] = useState(getPastDateStr(0));

  // Checklist table results
  const [queryResults, setQueryResults] = useState<IManualBook[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  // Record of updates: id -> { status: 'Approved' | 'Rejected', remarks: string }
  const [rowEdits, setRowEdits] = useState<Record<string, { status?: 'Approved' | 'Rejected'; remarks: string }>>({});
  const selectedTxnType = txnTypes.find(t => t.id === searchTxnType);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (!activeBranchId) {
        if (!cancelled) {
          setIsLoadingList(false);
        }
        return;
      }

      try {
        setIsLoadingList(true);
        const data = await manualBillBookApi.findAll(activeBranchId);
        if (cancelled) return;
        setDispatches(data);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to fetch dispatches list.');
      } finally {
        if (!cancelled) {
          setIsLoadingList(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeBranchId, reloadToken]);

  const handleProcessQuery = async () => {
    if (!activeBranchId) return;
    try {
      setIsProcessing(true);
      const data = await manualBillBookApi.findAll(
        activeBranchId,
        searchStatus || undefined,
        searchTxnType === 'ALL' ? undefined : searchTxnType,
        fromDate || undefined,
        toDate || undefined
      );
      if (selectedBookId) {
        setQueryResults(data.filter(b => b.id === selectedBookId));
      } else {
        setQueryResults(data);
      }
      setRowEdits({});
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to query records.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckboxChange = (id: string, status: 'Approved' | 'Rejected') => {
    setRowEdits(prev => {
      const current = prev[id] || { remarks: '' };
      const nextStatus = current.status === status ? undefined : status;
      return {
        ...prev,
        [id]: {
          ...current,
          status: nextStatus,
        }
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
        }
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
      // Also refresh master list
      setReloadToken(token => token + 1);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save acknowledgements.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRowClick = (book: IManualBook) => {
    // Pre-populate filter parameters
    setSearchStatus(book.status);
    setSearchTxnType(book.transactionType);
    
    const dispatchDate = new Date(book.dispatchDate);
    const fromD = new Date(dispatchDate);
    fromD.setDate(fromD.getDate() - 15);
    const toD = new Date(dispatchDate);
    toD.setDate(toD.getDate() + 15);

    setFromDate(fromD.toISOString().slice(0, 10));
    setToDate(toD.toISOString().slice(0, 10));

    setSelectedBookId(book.id);
    setView('detail');

    // Clear previous query results (do not auto-process)
    setQueryResults([]);
    setRowEdits({});
  };

  if (!activeBranchId) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-slate-500 font-medium">Please select your active branch workplace to proceed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-slate-200 pb-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manual Bill Status</h1>
          {view === 'detail' && (
            <button
              onClick={() => setView('list')}
              className="cursor-pointer rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
            >
              Back to List
            </button>
          )}
        </div>
        <p className="text-sm text-slate-500">
          Acknowledge and process manual bill books allocated to your branch.
        </p>
      </div>

      {view === 'list' ? (
        /* List View of Dispatched Books */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-slate-800 text-sm">Dispatches</h3>
          </div>

          {isLoadingList ? (
            <div className="py-20 flex justify-center"><Loader /></div>
          ) : dispatches.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-slate-500">No dispatches found for this branch.</p>
              <button
                onClick={() => {
                  setView('detail');
                  setQueryResults([]);
                }}
                className="mt-4 cursor-pointer inline-flex items-center justify-center rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 transition"
              >
                Go to Manual Bill Status Search
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 font-medium select-none">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">No</th>
                    <th className="px-6 py-3">Branch</th>
                    <th className="px-6 py-3">Txn Type</th>
                    <th className="px-6 py-3">Books From-To</th>
                    <th className="px-6 py-3">Vouchers/Book</th>
                    <th className="px-6 py-3">MV From-To</th>
                    <th className="px-6 py-3">Assigned To</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {dispatches.map(book => (
                    <tr
                      key={book.id}
                      onClick={() => handleRowClick(book)}
                      className="hover:bg-slate-50/80 cursor-pointer transition"
                    >
                      <td className="px-6 py-4">{new Date(book.dispatchDate).toISOString().slice(0, 10)}</td>
                      <td className="px-6 py-4 font-mono font-semibold text-slate-900">{book.no}</td>
                      <td className="px-6 py-4 font-semibold text-xs text-slate-600">{book.branchCode || 'Unknown'}</td>
                      <td className="px-6 py-4">{book.transactionType}</td>
                      <td className="px-6 py-4">{book.bookNoFrom} - {book.bookNoTo}</td>
                      <td className="px-6 py-4">{book.vouchersPerBook}</td>
                      <td className="px-6 py-4 font-semibold text-sky-800">{book.mvNoFrom} - {book.mvNoTo}</td>
                      <td className="px-6 py-4">{book.assignedTo}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border ${
                          book.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : book.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {book.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
                          { value: 'Pending', label: 'Pending' },
                          { value: 'Approved', label: 'Approved' },
                          { value: 'Rejected', label: 'Rejected' }
                        ].find(o => o.value === searchStatus)
                  }
                  onChange={(
                    option: MultiValue<AsyncSelectOption> | SingleValue<AsyncSelectOption>
                  ) => {
                    const selectedOption = Array.isArray(option)
                      ? option[0] ?? null
                      : option;

                    setSearchStatus(selectedOption?.value ? String(selectedOption.value) : '');
                    setSelectedBookId(null);
                  }}
                  loadOptions={async () => ({
                    options: [
                      { value: 'Pending', label: 'Pending' },
                      { value: 'Approved', label: 'Approved' },
                      { value: 'Rejected', label: 'Rejected' },
                      { value: '', label: 'All' }
                    ],
                    hasMore: false
                  })}
                  isClearable={false}
                />
              </div>

              <div>
                <AsyncSelect
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
                    option: MultiValue<AsyncSelectOption> | SingleValue<AsyncSelectOption>
                  ) => {
                    const selectedOption = Array.isArray(option)
                      ? option[0] ?? null
                      : option;

                    setSearchTxnType(selectedOption?.value ? String(selectedOption.value) : 'ALL');
                    setSelectedBookId(null);
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
                <DatePicker
                  label="From Date *"
                  selected={fromDate ? new Date(fromDate + 'T00:00:00') : null}
                  onChange={date => {
                    if (date) {
                      const y = date.getFullYear();
                      const m = String(date.getMonth() + 1).padStart(2, '0');
                      const d = String(date.getDate()).padStart(2, '0');
                      setFromDate(`${y}-${m}-${d}`);
                    } else {
                      setFromDate('');
                    }
                    setSelectedBookId(null);
                  }}
                />
              </div>

              <div>
                <DatePicker
                  label="To Date *"
                  selected={toDate ? new Date(toDate + 'T00:00:00') : null}
                  onChange={date => {
                    if (date) {
                      const y = date.getFullYear();
                      const m = String(date.getMonth() + 1).padStart(2, '0');
                      const d = String(date.getDate()).padStart(2, '0');
                      setToDate(`${y}-${m}-${d}`);
                    } else {
                      setToDate('');
                    }
                    setSelectedBookId(null);
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
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-sm">Dispatches Checklist</h3>
            </div>

            {queryResults.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-slate-500">No records found matching query criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 font-medium select-none">
                      <th className="px-4 py-3">Request No</th>
                      <th className="px-4 py-3">Request Date</th>
                      <th className="px-4 py-3">Branch</th>
                      <th className="px-4 py-3">Transaction Type</th>
                      <th className="px-4 py-3">Book No From</th>
                      <th className="px-4 py-3">Book No To</th>
                      <th className="px-4 py-3">No Of Voucher</th>
                      <th className="px-4 py-3">MV No.From</th>
                      <th className="px-4 py-3">MV No.To</th>
                      <th className="px-4 py-3">Remarks</th>
                      <th className="px-4 py-3 text-center">APPROVE</th>
                      <th className="px-4 py-3 text-center">REJECT</th>
                      <th className="px-4 py-3">REMARKS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {queryResults.map(book => {
                      const edit = rowEdits[book.id] || { remarks: '' };
                      const isApproved = edit.status === 'Approved' || (book.status === 'Approved' && edit.status === undefined);
                      const isRejected = edit.status === 'Rejected' || (book.status === 'Rejected' && edit.status === undefined);
                      const displayRemarks = edit.remarks !== undefined && edit.status !== undefined ? edit.remarks : (book.approvalRemarks || '');
                      const isReadOnly = book.status !== 'Pending';

                      return (
                        <tr key={book.id} className="hover:bg-slate-50/70 transition align-middle">
                          <td className="px-4 py-4 font-mono font-semibold text-slate-900">{book.no}</td>
                          <td className="px-4 py-4 text-xs whitespace-nowrap">
                            {new Date(book.dispatchDate).toLocaleDateString()} 00:00:00
                          </td>
                          <td className="px-4 py-4 font-semibold text-xs">{book.branchCode || 'Unknown'}</td>
                          <td className="px-4 py-4 text-xs">{book.transactionType}</td>
                          <td className="px-4 py-4">{book.bookNoFrom}</td>
                          <td className="px-4 py-4">{book.bookNoTo}</td>
                          <td className="px-4 py-4">{book.vouchersPerBook}</td>
                          <td className="px-4 py-4 font-mono text-xs">{book.mvNoFrom}</td>
                          <td className="px-4 py-4 font-mono text-xs">{book.mvNoTo}</td>
                          <td className="px-4 py-4 text-xs max-w-[120px] truncate" title={book.remarks}>
                            {book.remarks || '-'}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={isApproved}
                              disabled={isReadOnly}
                              onChange={() => handleCheckboxChange(book.id, 'Approved')}
                              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </td>
                          <td className="px-4 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={isRejected}
                              disabled={isReadOnly}
                              onChange={() => handleCheckboxChange(book.id, 'Rejected')}
                              className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <input
                              type="text"
                              value={displayRemarks}
                              disabled={isReadOnly}
                              onChange={e => handleRemarksChange(book.id, e.target.value)}
                              placeholder="Approval details..."
                              className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-100 disabled:text-slate-500"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {queryResults.length > 0 && (
              <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                <button
                  onClick={handleSaveReviews}
                  disabled={isSaving}
                  className="cursor-pointer inline-flex items-center justify-center rounded-md bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 transition disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualBillBookAcknowledgementPage;
