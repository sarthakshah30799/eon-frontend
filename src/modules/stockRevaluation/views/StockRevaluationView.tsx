import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Button, CardSection } from '@/components/ui';
import { useAuth } from '@/lib/AuthContext';
import { branchProfileApi } from '@/api/branchProfile';
import { counterProfileApi } from '@/api/counterProfile';
import { useListAdditionalSettings } from '@/modules/additionalSettings/hooks';
import { getAdditionalSettingTextValue } from '@/modules/additionalSettings/utils';
import { downloadBlob } from '@/modules/reports/utils';
import { useStockRevaluation } from '../hooks';
import type {
  StockRevaluationFrequency,
  StockRevaluationTarget,
} from '@/api/stockRevaluation';

const formatDate = (value: string) => {
  const [year, month, day] = value.slice(0, 10).split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
};

const formatAmount = (value: string | number) => Number(value || 0).toFixed(2);
const frequencyLabel = (value?: string) =>
  value
    ?.replace('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, letter => letter.toUpperCase()) ?? 'Not configured';

export const StockRevaluationView = () => {
  const { user, activeBranchId, activeCounterId } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTargets, setSelectedTargets] = useState<
    StockRevaluationTarget[]
  >(() =>
    activeBranchId && activeCounterId
      ? [{ branchId: activeBranchId, counterId: activeCounterId }]
      : []
  );
  const [file, setFile] = useState<File | null>(null);
  const { data: branches = [] } = useQuery({
    queryKey: ['branch-profiles-all', { activeOnly: true }],
    queryFn: () => branchProfileApi.getAllBranchProfiles({ activeOnly: true }),
  });
  const { data: counters = [] } = useQuery({
    queryKey: ['counter-profiles-all', { activeOnly: true }],
    queryFn: () => counterProfileApi.getAllCounterProfiles({ activeOnly: true }),
  });
  const { data: settings = [] } = useListAdditionalSettings();
  const stockSetting = getAdditionalSettingTextValue(
    settings,
    'STOCK_REVALUATION_SETTINGS',
    'STOCK_REVALUATION_FREQUENCY'
  );
  const isAllAccess = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);
  const visibleBranches = useMemo(
    () =>
      isAllAccess
        ? branches
        : branches.filter(branch => branch.id === activeBranchId),
    [activeBranchId, branches, isAllAccess]
  );
  const counterOptions = useMemo(
    () =>
      counters.filter(counter =>
        visibleBranches.some(branch =>
          (branch.connectCounterIds ?? []).includes(counter.id)
        )
      ),
    [counters, visibleBranches]
  );
  const effectiveFrequency =
    (stockSetting?.toUpperCase() as StockRevaluationFrequency | undefined) ||
    'MONTHLY';
  const selected = useStockRevaluation(selectedTargets, effectiveFrequency);

  const toggleTarget = (target: StockRevaluationTarget, checked: boolean) => {
    setSelectedTargets(previous =>
      checked
        ? previous.some(
            item =>
              item.branchId === target.branchId &&
              item.counterId === target.counterId
          )
          ? previous
          : [...previous, target]
        : previous.filter(
            item =>
              item.branchId !== target.branchId ||
              item.counterId !== target.counterId
          )
    );
  };

  const process = async () => {
    if (!selectedTargets.length)
      return toast.error('Select at least one branch and counter');
    try {
      await selected.processUploaded({
        targets: selectedTargets,
        frequency: effectiveFrequency,
      });
      toast.success('Stock revaluation processed successfully');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to process stock revaluation'
      );
    }
  };

  const upload = async () => {
    if (!selectedTargets.length)
      return toast.error('Select at least one branch and counter');
    if (!file) return toast.error('Upload a stock revaluation template');
    try {
      await selected.process({
        targets: selectedTargets,
        frequency: effectiveFrequency,
        file,
      });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success('Stock revaluation rates uploaded successfully');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to upload stock revaluation rates'
      );
    }
  };

  const downloadTemplate = async () => {
    try {
      downloadBlob(
        await selected.downloadTemplate(),
        'stock-revaluation-template.xlsx'
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to download template'
      );
    }
  };

  const rows = selected.reports.flatMap(report =>
    report.items.map(item => ({ report, item }))
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">
          Stock Revaluation
        </h1>
        <p className="text-xs text-text-secondary">
          Upload period-end rates and compare them with the counter stock
          holding value.
        </p>
      </div>
      <CardSection heading="Revaluation Input" className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2 rounded-md border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold text-text-primary">
              Branch and Counter
            </p>
            {visibleBranches.map(branch => (
              <div key={branch.id} className="space-y-1">
                <p className="text-xs font-medium text-text-secondary">
                  {branch.code} - {branch.name}
                </p>
                {(branch.connectCounterIds ?? [])
                  .map(counterId =>
                    counters.find(counter => counter.id === counterId)
                  )
                  .filter((counter): counter is (typeof counters)[number] =>
                    Boolean(counter)
                  )
                  .map(counter => {
                    const checked = selectedTargets.some(
                      target =>
                        target.branchId === branch.id &&
                        target.counterId === counter.id
                    );
                    return (
                      <label
                        key={counter.id}
                        className="flex items-center gap-2 text-xs text-text-primary"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={
                            !isAllAccess &&
                            (branch.id !== activeBranchId ||
                              counter.id !== activeCounterId)
                          }
                          onChange={event =>
                            toggleTarget(
                              { branchId: branch.id, counterId: counter.id },
                              event.target.checked
                            )
                          }
                        />
                        {counter.counterNo} - {counter.name}
                      </label>
                    );
                  })}
              </div>
            ))}
            {!counterOptions.length && (
              <p className="text-xs text-text-secondary">
                No active counters available
              </p>
            )}
            <p className="text-[11px] text-text-secondary">
              {isAllAccess
                ? 'Admin/HO can select multiple branch-counter combinations'
                : 'Current branch and counter only'}
            </p>
          </div>
          <div className="space-y-3 rounded-md border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold text-text-primary">
              Configured frequency
            </p>
            <p className="text-sm text-text-primary">
              {frequencyLabel(stockSetting)}
            </p>
            <p className="text-[11px] text-text-secondary">
              The uploaded date is converted to the financial-year period end.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isAllAccess && (
            <Button
              type="button"
              variant="outline"
              onClick={() => void downloadTemplate()}
              disabled={selected.isDownloadingTemplate}
            >
              Download Template
            </Button>
          )}
          {isAllAccess && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose Template
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={event => setFile(event.target.files?.[0] ?? null)}
              />
              <span className="text-xs text-text-secondary">
                {file?.name ?? 'No file selected'}
              </span>
              <Button
                type="button"
                onClick={() => void upload()}
                disabled={selected.isProcessing || !stockSetting}
              >
                {selected.isProcessing ? 'Uploading...' : 'Upload Rates'}
              </Button>
            </>
          )}
          <Button
            type="button"
            onClick={() => void process()}
            disabled={
              selected.isProcessingUploaded ||
              !stockSetting ||
              selected.pendingUploads.length === 0
            }
          >
            {selected.isProcessingUploaded ? 'Processing...' : 'Process'}
          </Button>
          {!isAllAccess && (
            <p className="w-full text-xs text-text-secondary">
              Rates must be uploaded by Admin, HO, or HO Staff before you can
              process them.
            </p>
          )}
          {selected.pendingUploads.length > 0 && (
            <p className="w-full text-xs text-emerald-700">
              Rates uploaded and ready for processing.
            </p>
          )}
          {isAllAccess && selected.pendingUploads.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                void Promise.all(
                  selected.pendingUploads.map(upload =>
                    selected.remove(upload.id)
                  )
                )
                  .then(() => toast.success('Uploaded rates removed'))
                  .catch(error =>
                    toast.error(
                      error instanceof Error ? error.message : 'Delete failed'
                    )
                  )
              }
              disabled={selected.isDeleting}
            >
              Remove Uploaded Rates
            </Button>
          )}
        </div>
        {!stockSetting && (
          <p className="text-xs text-amber-700">
            Configure Stock Revaluation Frequency in Additional Settings before
            processing.
          </p>
        )}
        {selected.reports.length > 0 && (
          <p className="text-xs text-amber-700">
            Delete the processed revaluation for this period before uploading a
            replacement.
          </p>
        )}
      </CardSection>
      {rows.length > 0 && (
        <CardSection
          heading="Stock Revaluation Report"
          className="overflow-x-auto"
        >
          <div className="mb-3 flex items-center justify-between text-xs">
            <span>
              {selected.reports[0]?.branchSnapshot?.label} /{' '}
              {selected.reports[0]?.counterSnapshot?.label} -{' '}
              {formatDate(selected.reports[0]?.valuationDate ?? '')}
            </span>
            {isAllAccess && (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  void Promise.all(
                    selected.reports.map(report => selected.remove(report.id))
                  )
                    .then(() => toast.success('Stock revaluation deleted'))
                    .catch(error =>
                      toast.error(
                        error instanceof Error ? error.message : 'Delete failed'
                      )
                    )
                }
                disabled={selected.isDeleting}
              >
                Delete Upload
              </Button>
            )}
          </div>
          <table className="min-w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-text-secondary">
                <th className="px-2 py-2">Branch</th>
                <th className="px-2 py-2">Counter</th>
                <th className="px-2 py-2">Valuation Date</th>
                <th className="px-2 py-2">Currency</th>
                <th className="px-2 py-2">Closing Quantity</th>
                <th className="px-2 py-2">AWP</th>
                <th className="px-2 py-2">Closing INR</th>
                <th className="px-2 py-2">New Rate</th>
                <th className="px-2 py-2">New INR</th>
                <th className="px-2 py-2">Difference INR</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ report, item }) => (
                <tr
                  key={`${report.id}-${item.id}`}
                  className="border-b border-slate-100"
                >
                  <td className="px-2 py-2">
                    {report.branchSnapshot?.label ??
                      report.branchSnapshot?.name ??
                      report.branchId}
                  </td>
                  <td className="px-2 py-2">
                    {report.counterSnapshot?.label ??
                      report.counterSnapshot?.name ??
                      report.counterId}
                  </td>
                  <td className="px-2 py-2">
                    {formatDate(report.valuationDate)}
                  </td>
                  <td className="px-2 py-2">
                    {item.currencySnapshot?.currencyCode} -{' '}
                    {item.currencySnapshot?.currencyName}
                  </td>
                  <td className="px-2 py-2">
                    {Number(item.closingQuantity).toFixed(7)}
                  </td>
                  <td className="px-2 py-2">{Number(item.awp).toFixed(7)}</td>
                  <td className="px-2 py-2">
                    {formatAmount(item.closingInrAmount)}
                  </td>
                  <td className="px-2 py-2">
                    {Number(item.newRate).toFixed(7)}
                  </td>
                  <td className="px-2 py-2">
                    {formatAmount(item.newInrAmount)}
                  </td>
                  <td
                    className={`px-2 py-2 font-semibold ${Number(item.differenceInr) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}
                  >
                    {formatAmount(item.differenceInr)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardSection>
      )}
    </div>
  );
};

export default StockRevaluationView;
