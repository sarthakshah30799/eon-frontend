import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { manualBillBookApi, type IManualBookDPMappingGroup } from '@/api';
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
import { CashierBillBookListView, CashierDPUnmapView, type ICashierBookRow } from '@/modules/manual-bill-books/components';
import type { MultiValue, SingleValue } from 'react-select';
import toast from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface IDPMappingRow {
  manualBookId: string;
  bookNo: number;
  transactionType: string;
  mvNoFrom: number;
  mvNoTo: number;
  qty: number;
  userId: string;
  assignedToUserName: string;
  pageIds: string[];
  remarks: string;
  isCheck: boolean;
  deliveryPersonId: string;
}

export const ManualBillDPMappingPage = () => {
  const location = useLocation();
  return <ManualBillDPMappingPageContent key={location.pathname} />;
};

const ManualBillDPMappingPageContent = () => {
  const { activeBranchId, user } = useAuth();
  const location = useLocation();

  const activeTab = location.pathname.includes('dp-unmapping') ? 'unmap' : 'map';
  const isCashierOrDelivery = !!(user?.isCashier || user?.isDeliveryBoy);

  // Cashier: selected row from the list view
  const [cashierRow, setCashierRow] = useState<ICashierBookRow | null>(null);

  // Filters
  const [txnType, setTxnType] = useState('ALL');
  const [bookNoStr, setBookNoStr] = useState('');
  const [mvNoFromStr, setMvNoFromStr] = useState('');
  const [mvNoToStr, setMvNoToStr] = useState('');

  // Options & table state
  const [deliveryPersons, setDeliveryPersons] = useState<Array<{ id: string; name: string }>>([]);
  const [txnTypes, setTxnTypes] = useState<Array<{ id: string; label: string }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDP, setIsLoadingDP] = useState(true);
  const [rows, setRows] = useState<IDPMappingRow[]>([]);
  const [hasProcessed, setHasProcessed] = useState(false);

  const getErrorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback;

  useEffect(() => {
    categoryOptionsApi
      .getCategoryOptionsByCode(CategoryOptionCodeEnum.Transaction)
      .then(options => setTxnTypes(options.map(o => ({ id: o.value, label: o.label }))))
      .catch(err => console.error('Failed to load transaction types', err));
  }, []);

  useEffect(() => {
    if (!activeBranchId) return;
    setIsLoadingDP(true);
    manualBillBookApi
      .getDeliveryPersons()
      .then(data => setDeliveryPersons(data))
      .catch(err => toast.error(getErrorMessage(err, 'Failed to load delivery person list.')))
      .finally(() => setIsLoadingDP(false));
  }, [activeBranchId]);

  // When cashier selects a row, pre-fill the form
  const handleCashierRowSelect = useCallback((row: ICashierBookRow) => {
    setCashierRow(row);
    setTxnType(row.txnType);
    // Default: first book in their assigned range, MV pre-filled for that book
    const firstBookNo = row.assignedBookNoFrom;
    const mvFrom = row.book.mvNoFrom + (firstBookNo - row.book.bookNoFrom) * row.book.vouchersPerBook;
    const mvTo = mvFrom + row.book.vouchersPerBook - 1;
    setBookNoStr(String(firstBookNo));
    setMvNoFromStr(String(Math.max(row.mvFrom, mvFrom)));
    setMvNoToStr(String(Math.min(row.mvTo, mvTo)));
    setRows([]);
    setHasProcessed(false);
  }, []);

  // When book number changes within the cashier's assigned range, auto-fill MV
  const handleCashierBookNoChange = (val: string) => {
    setBookNoStr(val);
    if (!val || !cashierRow) return;
    const bookNo = parseInt(val, 10);
    const { book, mvFrom: assignedMvFrom, mvTo: assignedMvTo } = cashierRow;
    const calcFrom = book.mvNoFrom + (bookNo - book.bookNoFrom) * book.vouchersPerBook;
    const calcTo = calcFrom + book.vouchersPerBook - 1;
    setMvNoFromStr(String(Math.max(assignedMvFrom, calcFrom)));
    setMvNoToStr(String(Math.min(assignedMvTo, calcTo)));
    setRows([]);
    setHasProcessed(false);
  };

  const handleProcess = async () => {
    if (!activeBranchId) return;
    const bookNo = parseInt(bookNoStr, 10);
    const fromVal = parseInt(mvNoFromStr, 10);
    const toVal = parseInt(mvNoToStr, 10);

    if (isNaN(bookNo) || bookNo < 1) {
      toast.error('Please enter a valid Book number.');
      return;
    }
    if (isNaN(fromVal) || isNaN(toVal) || fromVal < 1 || toVal < fromVal) {
      toast.error('Please enter a valid MV page range (From ≤ To).');
      return;
    }

    // Cashier validation: range must stay within their assigned range for this book
    if (cashierRow) {
      if (fromVal < cashierRow.mvFrom || toVal > cashierRow.mvTo) {
        toast.error(
          `MV range must be within your assigned range: ${cashierRow.mvRange}`
        );
        return;
      }
      // Book no must be within cashier's assigned book range
      if (bookNo < cashierRow.assignedBookNoFrom || bookNo > cashierRow.assignedBookNoTo) {
        toast.error(
          `Book No must be within your assigned range: ${cashierRow.assignedBookNoFrom} – ${cashierRow.assignedBookNoTo}`
        );
        return;
      }
    }

    try {
      setIsProcessing(true);
      const data = await manualBillBookApi.searchDPMapping({
        transactionType: txnType,
        bookNo,
        mvNoFrom: fromVal,
        mvNoTo: toVal,
        actionType: activeTab === 'map' ? 'MAP' : 'UNMAP',
      });

      const mappedRows: IDPMappingRow[] = data.map((item: IManualBookDPMappingGroup) => ({
        manualBookId: item.manualBookId,
        bookNo: item.bookNo,
        transactionType: item.transactionType,
        mvNoFrom: item.mvNoFrom,
        mvNoTo: item.mvNoTo,
        qty: item.qty,
        userId: item.userId,
        assignedToUserName: item.assignedToUserName,
        pageIds: item.pageIds,
        remarks: item.remarks || '',
        isCheck: false,
        deliveryPersonId: '',
      }));

      setRows(mappedRows);
      setHasProcessed(true);
      if (mappedRows.length === 0) {
        toast.error('No matching records found.');
      } else {
        toast.success(`Found ${mappedRows.length} page groups.`);
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to query page allocations.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRowCheckbox = (idx: number) =>
    setRows(prev => prev.map((r, i) => (i === idx ? { ...r, isCheck: !r.isCheck } : r)));

  const handleHeaderCheckbox = (checked: boolean) =>
    setRows(prev => prev.map(r => ({ ...r, isCheck: checked })));

  const handleRowRemarks = (idx: number, val: string) =>
    setRows(prev => prev.map((r, i) => (i === idx ? { ...r, remarks: val } : r)));

  const handleRowDP = (idx: number, val: string) =>
    setRows(prev => prev.map((r, i) => (i === idx ? { ...r, deliveryPersonId: val } : r)));

  const handleSave = async () => {
    const checkedRows = rows.filter(r => r.isCheck);
    if (checkedRows.length === 0) {
      toast.error('Please select at least one row to save.');
      return;
    }
    if (activeTab === 'map') {
      const missing = checkedRows.filter(r => !r.deliveryPersonId);
      if (missing.length > 0) {
        toast.error('Please select a Delivery Person for all selected rows.');
        return;
      }
    }
    try {
      setIsSaving(true);
      if (activeTab === 'map') {
        for (const row of checkedRows) {
          await manualBillBookApi.allocateToDP({
            pageIds: row.pageIds,
            deliveryPersonId: row.deliveryPersonId,
            remarks: row.remarks || undefined,
          });
        }
        toast.success('Successfully mapped pages to delivery person.');
      } else {
        for (const row of checkedRows) {
          await manualBillBookApi.deallocateFromDP({
            pageIds: row.pageIds,
            remarks: row.remarks || undefined,
          });
        }
        toast.success('Successfully unmapped pages back to cashier.');
      }
      await handleProcess();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to save mapping.'));
    } finally {
      setIsSaving(false);
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

  // ── Cashier: unmap tab — dedicated list/form/confirm flow ─────────────────
  if (isCashierOrDelivery && activeTab === 'unmap') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-1.5 border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Unmap from Delivery Person
          </h1>
          <p className="text-sm text-slate-500">
            Retrieve bill book pages that are currently assigned to a delivery person.
          </p>
        </div>
        <CashierDPUnmapView />
      </div>
    );
  }

  // ── Cashier: map tab — list view (no row selected yet) ────────────────────
  if (isCashierOrDelivery && !cashierRow) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-1.5 border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Map to Delivery Person
          </h1>
          <p className="text-sm text-slate-500">
            Select a bill book entry below to map its pages to a delivery person.
          </p>
        </div>
        <CashierBillBookListView onRowClick={handleCashierRowSelect} />
      </div>
    );
  }

  const allChecked = rows.length > 0 && rows.every(r => r.isCheck);
  const selectedTxnType = txnTypes.find(t => t.id === txnType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-slate-200 pb-5">
        {cashierRow && (
          <button
            type="button"
            onClick={() => { setCashierRow(null); setRows([]); setHasProcessed(false); }}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 mb-1 w-fit"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Back to list
          </button>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Manual Bill DP Mapping
        </h1>
        <p className="text-sm text-slate-500">
          Map individual manual bill book pages to delivery persons, or deallocate them.
        </p>
      </div>

      {/* Query Filter Box */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
          {activeTab === 'map' ? 'Map to DP Search' : 'Unmap DP Search'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Transaction Type */}
          <div>
            <AsyncSelect
              key={txnTypes.length}
              label="Transaction Type *"
              placeholder="Select Type"
              isDisabled={!!cashierRow}
              value={
                txnType === 'ALL'
                  ? { value: 'ALL', label: 'ALL' }
                  : selectedTxnType
                    ? { value: txnType, label: selectedTxnType.label }
                    : null
              }
              onChange={(option: MultiValue<AsyncSelectOption> | SingleValue<AsyncSelectOption>) => {
                const sel = Array.isArray(option) ? option[0] ?? null : option;
                setTxnType(sel?.value ? String(sel.value) : 'ALL');
              }}
              loadOptions={async () => ({
                options: [
                  { value: 'ALL', label: 'ALL' },
                  ...txnTypes.map(t => ({ value: t.id, label: t.label })),
                ],
                hasMore: false,
              })}
              isClearable={false}
            />
          </div>

          {/* Book No — auto-fills MV range for cashiers */}
          <div>
            <Input
              type="number"
              label="Book No *"
              min="1"
              value={bookNoStr}
              onChange={e => cashierRow ? handleCashierBookNoChange(e.target.value) : setBookNoStr(e.target.value)}
              placeholder="e.g. 11"
              valueTransform="none"
              classes={{ container: 'max-w-none' }}
            />
          </div>

          {/* MV No From */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              MV No From *
              {cashierRow && (
                <span className="ml-1 text-slate-400 font-normal">(min: {cashierRow.mvFrom})</span>
              )}
            </label>
            <input
              type="number"
              min={cashierRow ? cashierRow.mvFrom : 1}
              max={cashierRow ? cashierRow.mvTo : undefined}
              value={mvNoFromStr}
              onChange={e => {
                setMvNoFromStr(e.target.value);
                setRows([]);
                setHasProcessed(false);
              }}
              placeholder="e.g. 10001"
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs h-[38px] focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          {/* MV No To */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              MV No To *
              {cashierRow && (
                <span className="ml-1 text-slate-400 font-normal">(max: {cashierRow.mvTo})</span>
              )}
            </label>
            <input
              type="number"
              min={cashierRow ? cashierRow.mvFrom : 1}
              max={cashierRow ? cashierRow.mvTo : undefined}
              value={mvNoToStr}
              onChange={e => {
                setMvNoToStr(e.target.value);
                setRows([]);
                setHasProcessed(false);
              }}
              placeholder="e.g. 10001"
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs h-[38px] focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={handleProcess} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Process'}
          </Button>
        </div>
      </div>

      {/* Results Checklist */}
      {hasProcessed && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <h3 className="font-semibold text-slate-800 text-sm">Dispatches Checklist</h3>
            {rows.length > 0 && activeTab === 'unmap' && (
              <div className="text-xs font-semibold text-slate-500">
                Selected pages will be returned back to Cashier.
              </div>
            )}
          </div>

          {rows.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-500">No matching pages found to map.</p>
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
                    <th className="px-4 py-3">Remarks</th>
                    {activeTab === 'map' && <th className="px-4 py-3">Delivery Person</th>}
                    <th className="px-4 py-3">Transaction Type</th>
                    <th className="px-4 py-3">Book No</th>
                    <th className="px-4 py-3">MV No From</th>
                    <th className="px-4 py-3">MV No TO</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Current Assignee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 align-middle">
                  {rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-4 text-center">
                        <Checkbox
                          checked={row.isCheck}
                          onChange={() => handleRowCheckbox(idx)}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <textarea
                          rows={1}
                          value={row.remarks}
                          onChange={e => handleRowRemarks(idx, e.target.value)}
                          placeholder="Note..."
                          className="w-full min-w-[160px] rounded border border-slate-300 px-2 py-1 text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none"
                        />
                      </td>
                      {activeTab === 'map' && (
                        <td className="px-4 py-4">
                          {isLoadingDP ? (
                            <span className="text-xs text-slate-400">Loading...</span>
                          ) : (
                            <select
                              value={row.deliveryPersonId}
                              onChange={e => handleRowDP(idx, e.target.value)}
                              className="rounded border border-slate-300 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 w-36"
                            >
                              <option value="">Select DP</option>
                              {deliveryPersons.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                              ))}
                            </select>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-4 text-xs">{row.transactionType}</td>
                      <td className="px-4 py-4 font-semibold text-slate-800">{row.bookNo}</td>
                      <td className="px-4 py-4 font-mono text-xs">{row.mvNoFrom}</td>
                      <td className="px-4 py-4 font-mono text-xs">{row.mvNoTo}</td>
                      <td className="px-4 py-4">{row.qty}</td>
                      <td className="px-4 py-4 text-xs font-semibold text-slate-600">
                        {row.assignedToUserName}
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
                onClick={handleSave}
                disabled={isSaving}
                variant="default"
              >
                {isSaving ? 'Processing...' : activeTab === 'map' ? 'Save' : 'Unmap'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManualBillDPMappingPage;
