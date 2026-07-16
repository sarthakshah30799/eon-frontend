import { useMemo } from 'react';
import { Button } from '@/components/ui';
import { useAuth } from '@/lib/AuthContext';
import { SalePurchaseReportTable, SpecialReportFiltersSection } from '../components';
import { useSpecialReport } from '../hooks';
import { ReportExportFormatEnum } from '../types';
import { summarizeReportSelection } from '../utils';

export const SpecialReportView = () => {
  const { user } = useAuth();
  const report = useSpecialReport();
  const canView = Boolean(user);

  const currentSummary = useMemo(() => {
    const branchLabels = summarizeReportSelection(
      report.filters.branchIds,
      report.filters.branchOptions,
    );

    return {
      branches: branchLabels,
      template:
        report.filters.templateOptions.find(option => option.id === report.filters.template)?.label ??
        'Account Posting',
    };
  }, [
    report.filters.branchIds,
    report.filters.branchOptions,
    report.filters.template,
    report.filters.templateOptions,
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
          Special Reports
        </h1>
        <p className="max-w-3xl text-[11px] text-text-secondary">
          Account posting special report with branch filter and direct CSV/XLSX export.
        </p>
      </div>

      <SpecialReportFiltersSection filters={report.filters} />

      {report.filters.appliedFilters && (
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-text-secondary">
          Applied: Branches {currentSummary.branches.length ? currentSummary.branches.join(', ') : 'All'} | Template{' '}
          {currentSummary.template}
        </div>
      )}

      {report.filters.appliedFilters && (
        <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h2 className="text-sm font-semibold text-text-primary">Report View</h2>
              <p className="text-[11px] text-text-secondary">
                Every account posting is shown as a single row using transaction snapshots only.
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

export default SpecialReportView;
