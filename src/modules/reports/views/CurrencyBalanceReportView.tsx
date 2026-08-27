import { useMemo } from 'react';
import { Button } from '@/components/ui';
import { AccessDeniedState } from '@/components/ui/access-denied-state';
import { PAGE_STATUS_TEXTS } from '@/constants';
import { useAuth } from '@/lib/AuthContext';
import {
  CurrencyBalanceReportFiltersSection,
  CurrencyBalanceReportTable,
} from '../components';
import { useCurrencyBalanceReport } from '../hooks';
import { ReportExportFormatEnum } from '../types';
import { summarizeReportSelection } from '../utils';

export const CurrencyBalanceReportView = () => {
  const { user } = useAuth();
  const report = useCurrencyBalanceReport();
  const canView = Boolean(user);

  const currentSummary = useMemo(() => {
    const branchLabels = summarizeReportSelection(
      report.filters.branchIds,
      report.filters.branchOptions
    );
    const counterLabels = summarizeReportSelection(
      report.filters.counterIds,
      report.filters.counterOptions
    );
    const currencyLabel =
      report.filters.currencyOptions.find(
        option => option.id === report.filters.currencyId
      )?.label ?? 'All';
    const sortLabel = 'Date Asc';

    return {
      branches: branchLabels,
      counters: counterLabels,
      currency: currencyLabel,
      sortLabel,
    };
  }, [
    report.filters.branchIds,
    report.filters.branchOptions,
    report.filters.counterIds,
    report.filters.counterOptions,
    report.filters.currencyId,
    report.filters.currencyOptions,
    report.filters.appliedFilters,
  ]);

  if (!canView) {
    return (
      <AccessDeniedState message={PAGE_STATUS_TEXTS.ACCESS_DENIED_MESSAGE} />
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-text-primary">
          Currency Balance
        </h1>
        <p className="max-w-3xl text-[11px] text-text-secondary">
          Daily branch and counter INR balance summary with bulk and retail
          split plus CSV/XLSX export.
        </p>
      </div>

      <CurrencyBalanceReportFiltersSection filters={report.filters} />

      {report.filters.appliedFilters && (
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-text-secondary">
          Applied: {report.appliedDateRangeLabel} | Branches{' '}
          {currentSummary.branches.length
            ? currentSummary.branches.join(', ')
            : 'All'}{' '}
          | Counters{' '}
          {currentSummary.counters.length
            ? currentSummary.counters.join(', ')
            : 'All'}{' '}
          | Currency {currentSummary.currency} | Sort By{' '}
          {currentSummary.sortLabel}
        </div>
      )}

      {report.filters.appliedFilters && (
        <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h2 className="text-sm font-semibold text-text-primary">
                Report View
              </h2>
              <p className="text-[11px] text-text-secondary">
                Each date, branch, and counter combination is summarized into a
                single row using INR values.
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
                  onClick={() =>
                    report.setExportFormat(ReportExportFormatEnum.XLSX)
                  }
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
                  onClick={() =>
                    report.setExportFormat(ReportExportFormatEnum.CSV)
                  }
                >
                  CSV
                </Button>
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  void report.downloadReport();
                }}
                disabled={!report.isReady || report.isLoadingReport}
              >
                Download
              </Button>
            </div>
          </div>

          {report.reportError && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
              Failed to load report data. Please try again.
            </div>
          )}

          <CurrencyBalanceReportTable
            columns={report.reportColumns}
            rows={report.reportRows}
            loading={report.isLoadingReport || report.isFetchingReport}
          />
        </section>
      )}
    </div>
  );
};

export default CurrencyBalanceReportView;
