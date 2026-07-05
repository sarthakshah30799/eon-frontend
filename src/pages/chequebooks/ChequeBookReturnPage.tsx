import { useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useAuth } from '@/lib/AuthContext';
import toast from 'react-hot-toast';
import { Button, Input } from '@/components/ui';
import { FormFieldSelect } from '@/components/forms';
import { accountProfileApi } from '@/api/accountProfile/accountProfile.api';
import { chequebookApi } from '@/api';

interface IReturnRow {
  checkBookId: string;
  bookNo: number;
  bankAccountCode: string;
  mvNoFrom: number;
  mvNoTo: number;
  qty: number;
  pageIds: string[];
  pageNos: number[];
  remarks: string;
  isCheck: boolean;
}

export const ChequeBookReturnPage = () => {
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
  const [bookNoStr, setBookNoStr] = useState('');
  const [chequeNoFromStr, setChequeNoFromStr] = useState('');
  const [chequeNoToStr, setChequeNoToStr] = useState('');

  // Table rows
  const [rows, setRows] = useState<IReturnRow[]>([]);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleProcess = async () => {
    if (!activeBranchId) return;
    const bookNo = parseInt(bookNoStr, 10);
    const fromVal = parseInt(chequeNoFromStr, 10);
    const toVal = parseInt(chequeNoToStr, 10);

    if (isNaN(bookNo) || bookNo < 1) {
      toast.error('Please enter a valid Book number.');
      return;
    }
    if (isNaN(fromVal) || isNaN(toVal) || fromVal < 1 || toVal < fromVal) {
      toast.error('Please enter a valid Cheque range (From <= To).');
      return;
    }

    try {
      setIsProcessing(true);
      const data = await chequebookApi.searchCashierReturn({
        bankAccountCode: watchedBankAccountCode || 'ALL',
        bookNo,
        chequeNoFrom: fromVal,
        chequeNoTo: toVal,
      });

      const matchedRows: IReturnRow[] = data.map((item: any) => ({
        checkBookId: item.checkBookId,
        bookNo: item.bookNo,
        bankAccountCode: item.bankAccountCode,
        mvNoFrom: item.mvNoFrom,
        mvNoTo: item.mvNoTo,
        qty: item.qty,
        pageIds: item.pageIds,
        pageNos: item.pageNos,
        remarks: item.remarks || '',
        isCheck: false,
      }));

      setRows(matchedRows);
      setHasProcessed(true);
      if (matchedRows.length === 0) {
        toast.error('No matching allocated cheque pages found.');
      } else {
        toast.success(`Found ${matchedRows.length} page groups.`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to search allocated leaves.');
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

  const handleSaveReturn = async () => {
    const checkedRows = rows.filter(r => r.isCheck);
    if (checkedRows.length === 0) {
      toast.error('Please select at least one row to return.');
      return;
    }

    try {
      setIsSaving(true);
      const allPageNos = checkedRows.flatMap(r => r.pageNos);
      
      await chequebookApi.returnPages(allPageNos);
      toast.success('Cashier leaves returned to Manager successfully.');
      
      await handleProcess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to return pages.');
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Return Cashier To Manager</h1>
        <p className="text-sm text-slate-500">
          Return allocated chequebook leaves from Cashier back to Manager (Stock).
        </p>
      </div>

      {/* Query Filter box */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
          Return Search
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 align-end">
          <FormProvider {...txnTypeForm}>
            <div>
              <FormFieldSelect
                name="bankAccountCode"
                label="Bank Account Code"
                placeholder="ALL"
                loadOptions={async (inputValue) => {
                  try {
                    const response = await accountProfileApi.getAccountProfiles({
                      page: 1,
                      limit: 100,
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
                      hasMore: false,
                    };
                  } catch {
                    return {
                      options: [],
                      hasMore: false,
                    };
                  }
                }}
              />
            </div>
          </FormProvider>

          <div>
            <Input
              type="number"
              label="Book No"
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
              label="Cheque No. From"
              min="1"
              value={chequeNoFromStr}
              onChange={e => setChequeNoFromStr(e.target.value)}
              placeholder="e.g. 10001"
              valueTransform="none"
              classes={{ container: 'max-w-none' }}
            />
          </div>

          <div>
            <Input
              type="number"
              label="Cheque No. To"
              min="1"
              value={chequeNoToStr}
              onChange={e => setChequeNoToStr(e.target.value)}
              placeholder="e.g. 10050"
              valueTransform="none"
              classes={{ container: 'max-w-none' }}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleProcess}
            disabled={isProcessing}
            size="sm"
          >
            {isProcessing ? 'Processing...' : 'Process'}
          </Button>
        </div>
      </div>

      {/* Checklist Table Section */}
      {hasProcessed && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 text-sm">Leaves Checklist</h3>
          </div>

          {rows.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-500">No leaves found to return.</p>
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
                    <th className="px-4 py-3">Book No</th>
                    <th className="px-4 py-3">Cheque No. From</th>
                    <th className="px-4 py-3">Cheque No. To</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 align-middle">
                  {rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={row.isCheck}
                          onChange={() => handleRowCheckbox(idx)}
                          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-800">{row.bookNo}</td>
                      <td className="px-4 py-4 font-mono text-xs">{row.mvNoFrom}</td>
                      <td className="px-4 py-4 font-mono text-xs">{row.mvNoTo}</td>
                      <td className="px-4 py-4">{row.qty}</td>
                      <td className="px-4 py-4 text-slate-500 truncate max-w-[200px]" title={row.remarks}>
                        {row.remarks || '-'}
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
                onClick={handleSaveReturn}
                disabled={isSaving}
                size="sm"
              >
                {isSaving ? 'Processing...' : 'Return'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChequeBookReturnPage;
