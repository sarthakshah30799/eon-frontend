import { useState, useEffect } from 'react';
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
import type { MultiValue, SingleValue } from 'react-select';
import toast from 'react-hot-toast';

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
}

export const ManualBillDPMappingPage = () => {
  const location = useLocation();
  return <ManualBillDPMappingPageContent key={location.pathname} />;
};

const ManualBillDPMappingPageContent = () => {
  const { activeBranchId } = useAuth();
  const location = useLocation();

  const activeTab = location.pathname.includes('dp-unmapping')
    ? 'unmap'
    : 'map';

  // Filters
  const [txnType, setTxnType] = useState('ALL');
  const [bookNoStr, setBookNoStr] = useState('');
  const [mvNoFromStr, setMvNoFromStr] = useState('');
  const [mvNoToStr, setMvNoToStr] = useState('');

  // Options & Table states
  const [deliveryPersons, setDeliveryPersons] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [txnTypes, setTxnTypes] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDP, setIsLoadingDP] = useState(true);

  useEffect(() => {
    const fetchTxnTypes = async () => {
      try {
        const options =
          await categoryOptionsApi.getCategoryOptionsByCode(CategoryOptionCodeEnum.Transaction);
        setTxnTypes(options.map(o => ({ id: o.id, label: o.label })));
      } catch (err) {
        console.error('Failed to load transaction types', err);
      }
    };
    fetchTxnTypes();
  }, []);

  const [rows, setRows] = useState<IDPMappingRow[]>([]);
  const [hasProcessed, setHasProcessed] = useState(false);

  // Bulk allocate state
  const [bulkDPId, setBulkDPId] = useState('');

  const deliveryPersonOptions = deliveryPersons.map(person => ({
    value: person.id,
    label: person.name,
  }));
  const loadDeliveryPersonOptions = async (): Promise<AsyncSelectResponse> => ({
    options: deliveryPersonOptions,
    hasMore: false,
  });

  const getErrorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback;

  // Fetch Delivery Persons for mapping
  useEffect(() => {
    const fetchDPList = async () => {
      if (!activeBranchId) return;
      try {
        setIsLoadingDP(true);
        const data = await manualBillBookApi.getDeliveryPersons();
        setDeliveryPersons(data);
      } catch (err: unknown) {
        toast.error(
          getErrorMessage(err, 'Failed to load delivery person list.')
        );
      } finally {
        setIsLoadingDP(false);
      }
    };
    fetchDPList();
  }, [activeBranchId]);

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
      toast.error('Please enter a valid MV page range (From <= To).');
      return;
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

      const mappedRows: IDPMappingRow[] = data.map(
        (item: IManualBookDPMappingGroup) => ({
          manualBookId: item.manualBookId,
          bookNo: item.bookNo,
          transactionType: item.transactionType || item.transactionType,
          mvNoFrom: item.mvNoFrom,
          mvNoTo: item.mvNoTo,
          qty: item.qty,
          userId: item.userId,
          assignedToUserName: item.assignedToUserName,
          pageIds: item.pageIds,
          remarks: item.remarks || '',
          isCheck: false,
        })
      );

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

  const handleRowCheckbox = (idx: number) => {
    setRows(prev =>
      prev.map((r, i) => (i === idx ? { ...r, isCheck: !r.isCheck } : r))
    );
  };

  const handleHeaderCheckbox = (checked: boolean) => {
    setRows(prev => prev.map(r => ({ ...r, isCheck: checked })));
  };

  const handleRowRemarks = (idx: number, val: string) => {
    setRows(prev =>
      prev.map((r, i) => (i === idx ? { ...r, remarks: val } : r))
    );
  };

  const handleSave = async () => {
    const checkedRows = rows.filter(r => r.isCheck);
    if (checkedRows.length === 0) {
      toast.error('Please select at least one row to save.');
      return;
    }

    if (activeTab === 'map' && !bulkDPId) {
      toast.error('Please select a Delivery Person.');
      return;
    }

    try {
      setIsSaving(true);

      if (activeTab === 'map') {
        // Map to DP
        // Remarks can be taken from the first selected row or individual page updates
        // To keep it simple, we use the remarks specified on the rows
        for (const row of checkedRows) {
          await manualBillBookApi.allocateToDP({
            pageIds: row.pageIds,
            deliveryPersonId: bulkDPId,
            remarks: row.remarks || undefined,
          });
        }
        toast.success('Successfully mapped pages to delivery person.');
      } else {
        // Unmap DP
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

  const allChecked = rows.length > 0 && rows.every(r => r.isCheck);
  const selectedTxnType = txnTypes.find(t => t.id === txnType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Manual Bill DP Mapping
        </h1>
        <p className="text-sm text-slate-500">
          Map individual manual bill book pages to delivery persons, or
          deallocate them.
        </p>
      </div>

      {/* Query Filter Box */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
          {activeTab === 'map' ? 'Map to DP Search' : 'Unmap DP Search'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div>
            <AsyncSelect
              label="Transaction Type *"
              placeholder="Select Type"
              value={
                txnType === 'ALL'
                  ? { value: 'ALL', label: 'ALL' }
                  : selectedTxnType
                    ? {
                        value: txnType,
                        label: selectedTxnType.label,
                      }
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
                  ...txnTypes.map(t => ({ value: t.id, label: t.label })),
                ],
                hasMore: false,
              })}
              isClearable={false}
            />
          </div>

          <div>
            <Input
              type="number"
              label="Book No *"
              min="1"
              value={bookNoStr}
              onChange={e => setBookNoStr(e.target.value)}
              placeholder="e.g. 11"
              valueTransform="none"
              classes={{ container: 'max-w-none' }}
            />
          </div>

          <div>
            <Input
              type="number"
              label="MV No From *"
              min="1"
              value={mvNoFromStr}
              onChange={e => setMvNoFromStr(e.target.value)}
              placeholder="e.g. 10001"
              valueTransform="none"
              classes={{ container: 'max-w-none' }}
            />
          </div>

          <div>
            <Input
              type="number"
              label="MV No To *"
              min="1"
              value={mvNoToStr}
              onChange={e => setMvNoToStr(e.target.value)}
              placeholder="e.g. 10001"
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

      {/* Results Checklist Section */}
      {hasProcessed && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50">
            <h3 className="font-semibold text-slate-800 text-sm">
              Dispatches Checklist
            </h3>

            {/* Allocation Actions control */}
            {rows.length > 0 && activeTab === 'map' && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-600">
                  Allocate Delivery Person:
                </span>
                {isLoadingDP ? (
                  <span className="text-xs text-slate-500">Loading...</span>
                ) : (
                  <AsyncSelect
                    value={
                      deliveryPersonOptions.find(
                        option => option.value === bulkDPId
                      ) ?? null
                    }
                    onChange={option => {
                      const nextOption = Array.isArray(option) ? option[0] : option;
                      setBulkDPId(nextOption ? String(nextOption.value) : '');
                    }}
                    loadOptions={loadDeliveryPersonOptions}
                    placeholder="Select User"
                    isSearchable={false}
                    className="w-40"
                  />
                )}
              </div>
            )}

            {rows.length > 0 && activeTab === 'unmap' && (
              <div className="text-xs font-semibold text-slate-500">
                Selected pages will be returned back to Cashier.
              </div>
            )}
          </div>

          {rows.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-500">
                No matching pages found to map.
              </p>
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
                          className="w-full min-w-[200px] rounded border border-slate-300 px-2 py-1 text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none"
                        />
                      </td>
                      <td className="px-4 py-4 text-xs">
                        {row.transactionType}
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-800">
                        {row.bookNo}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs">
                        {row.mvNoFrom}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs">
                        {row.mvNoTo}
                      </td>
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
                {isSaving
                  ? 'Processing...'
                  : activeTab === 'map'
                    ? 'Save'
                    : 'Unmap'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManualBillDPMappingPage;
