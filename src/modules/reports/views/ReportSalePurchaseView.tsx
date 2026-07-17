import { useMemo } from 'react';
import { Button } from '@/components/ui';
import { useAuth } from '@/lib/AuthContext';
import { ReportCommonFiltersSection, SalePurchaseReportTable } from '../components';
import { useSalePurchaseReport } from '../hooks';
import { ReportExportFormatEnum, ReportSortByEnum, ReportTransactionTypeEnum } from '../types';
import { summarizeReportSelection } from '../utils';

export const ReportSalePurchaseView = () => {
  const { user } = useAuth();
  const report = useSalePurchaseReport();
  const canView = Boolean(user);

  const currentSummary = useMemo(() => {
    const stateLabels = summarizeReportSelection(report.filters.stateIds, report.filters.stateOptions);
    const branchLabels = summarizeReportSelection(report.filters.branchIds, report.filters.branchOptions);
    const counterLabels = summarizeReportSelection(report.filters.counterIds, report.filters.counterOptions);
    const typeLabels = summarizeReportSelection(
      report.filters.partyTypeCodes,
      report.filters.partyTypeOptions,
    );
    const txnTypeLabels = report.filters.transactionTypes.map(type =>
      type === ReportTransactionTypeEnum.PURCHASE ? 'Purchase' : 'Sale',
    );
    const sortLabel =
      report.filters.sortBy === ReportSortByEnum.DATE_DESC ? 'Date Desc' : 'Date Asc';

    return {
      states: stateLabels,
      branches: branchLabels,
      counters: counterLabels,
      types: typeLabels,
      transactionTypes: txnTypeLabels,
      sortLabel,
    };
  }, [
    report.filters.branchIds,
    report.filters.branchOptions,
    report.filters.counterIds,
    report.filters.counterOptions,
    report.filters.partyTypeCodes,
    report.filters.partyTypeOptions,
    report.filters.stateIds,
    report.filters.stateOptions,
    report.filters.transactionTypes,
    report.filters.sortBy,
  ]);

  if (!canView) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-text-secondary">
        You do not have access to this page.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-text-primary">
          Sale & Purchase Reports
        </h1>
      <p className="max-w-3xl text-[11px] text-text-secondary">
          Grouped report for review, flat export for CSV/XLSX downloads.
        </p>
      </div>

      <ReportCommonFiltersSection filters={report.filters} />

      {report.filters.appliedFilters && (
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-text-secondary">
          Applied: {report.filters.appliedDateRangeLabel} | States{' '}
          {currentSummary.states.length ? currentSummary.states.join(', ') : 'All'} | Branches{' '}
          {currentSummary.branches.length ? currentSummary.branches.join(', ') : 'All'} | Counters{' '}
          {currentSummary.counters.length ? currentSummary.counters.join(', ') : 'All'} | Party Types{' '}
          {currentSummary.types.length ? currentSummary.types.join(', ') : 'All'} | Transaction{' '}
          {currentSummary.transactionTypes.length
            ? currentSummary.transactionTypes.join(', ')
            : 'All'} | Sort By {currentSummary.sortLabel} | Party Profiles{' '}
          {report.filters.partyProfileSelection.allSelected
            ? report.filters.partyProfileSelection.excludedIds.length > 0
              ? `All matching except ${report.filters.partyProfileSelection.excludedIds.length}`
              : 'All matching'
            : report.filters.partyProfileSelection.selectedIds.length > 0
              ? `${report.filters.partyProfileSelection.selectedIds.length} selected`
              : 'None selected'}
        </div>
      )}

      {report.filters.appliedFilters && (
        <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h2 className="text-sm font-semibold text-text-primary">Report View</h2>
              <p className="text-[11px] text-text-secondary">
                Grouped rows show transaction details on the first line, then item subtotal rows.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
                <Button
                  type="button"
                  size="sm"
                  variant={
                    report.exportFormat === ReportExportFormatEnum.XLSX
                      ? 'default'
                      : 'outline'
                  }
                  className="h-7 rounded-full px-3 text-[11px]"
                  onClick={() => report.setExportFormat(ReportExportFormatEnum.XLSX)}
                >
                  XLSX
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={
                    report.exportFormat === ReportExportFormatEnum.CSV
                      ? 'default'
                      : 'outline'
                  }
                  className="h-7 rounded-full px-3 text-[11px]"
                  onClick={() => report.setExportFormat(ReportExportFormatEnum.CSV)}
                >
                  CSV
                </Button>
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  void report.downloadGroupedReport();
                }}
                disabled={!report.isReady || report.isLoadingReport}
              >
                Download
              </Button>

              <Button
                type="button"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  void report.downloadFlatReport();
                }}
                disabled={!report.isReady || report.isLoadingReport}
              >
                Download Flat
              </Button>
            </div>
          </div>

          {report.reportError && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
              Failed to load report data. Please try again.
            </div>
          )}

          <SalePurchaseReportTable
            columns={report.reportColumns}
            rows={report.reportRows}
            loading={report.isLoadingReport || report.isFetchingReport}
          />
        </section>
      )}
    </div>
  );
};

export default ReportSalePurchaseView;
