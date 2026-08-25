import { useMemo } from 'react';
import { Button } from '@/components/ui';
import { AccessDeniedState } from '@/components/ui/access-denied-state';
import { PAGE_STATUS_TEXTS } from '@/constants';
import { useAuth } from '@/lib/AuthContext';
import {
  Flm1DailyCnSummaryFiltersSection,
  Flm1DailyCnSummaryTable,
} from '../components';
import { FLM1_DAILY_CN_SUMMARY_TEXT } from '../constants/flm1DailyCnSummaryConstants';
import { useFlm1DailyCnSummary } from '../hooks';
import { ReportExportFormatEnum } from '../types';
import { summarizeReportSelection } from '../utils';

export const Flm1DailyCnSummaryView = () => {
  const { user } = useAuth();
  const reportState = useFlm1DailyCnSummary();
  const canView = Boolean(user);

  const currentSummary = useMemo(() => {
    const branchLabels = summarizeReportSelection(
      reportState.filters.branchIds,
      reportState.filters.branchOptions,
    );
    const productLabel =
      reportState.filters.productOptions.find(
        option => option.id === reportState.filters.productId,
      )?.label ?? FLM1_DAILY_CN_SUMMARY_TEXT.all;

    return {
      branches: branchLabels,
      product: productLabel,
    };
  }, [
    reportState.filters.branchIds,
    reportState.filters.branchOptions,
    reportState.filters.productId,
    reportState.filters.productOptions,
  ]);

  if (!canView) {
    return <AccessDeniedState message={PAGE_STATUS_TEXTS.ACCESS_DENIED_MESSAGE} />;
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-text-primary">
          {FLM1_DAILY_CN_SUMMARY_TEXT.title}
        </h1>
        <p className="max-w-3xl text-[11px] text-text-secondary">
          {FLM1_DAILY_CN_SUMMARY_TEXT.description}
        </p>
      </div>

      <Flm1DailyCnSummaryFiltersSection filters={reportState.filters} />

      {reportState.filters.appliedFilters && (
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-text-secondary">
          {FLM1_DAILY_CN_SUMMARY_TEXT.appliedPrefix}: {reportState.appliedDateRangeLabel} |{' '}
          {FLM1_DAILY_CN_SUMMARY_TEXT.branchHeading}{' '}
          {currentSummary.branches.length
            ? currentSummary.branches.join(', ')
            : FLM1_DAILY_CN_SUMMARY_TEXT.all}{' '}
          | {FLM1_DAILY_CN_SUMMARY_TEXT.productHeading} {currentSummary.product}
        </div>
      )}

      {reportState.filters.appliedFilters && (
        <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h2 className="text-sm font-semibold text-text-primary">
                {FLM1_DAILY_CN_SUMMARY_TEXT.reportViewTitle}
              </h2>
              <p className="text-[11px] text-text-secondary">
                {FLM1_DAILY_CN_SUMMARY_TEXT.reportViewDescription}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
                <Button
                  type="button"
                  size="sm"
                  variant={
                    reportState.exportFormat === ReportExportFormatEnum.XLSX
                      ? 'default'
                      : 'outline'
                  }
                  className="h-7 rounded-full px-3 text-[11px]"
                  onClick={() => reportState.setExportFormat(ReportExportFormatEnum.XLSX)}
                >
                  {FLM1_DAILY_CN_SUMMARY_TEXT.xlsx}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={
                    reportState.exportFormat === ReportExportFormatEnum.CSV
                      ? 'default'
                      : 'outline'
                  }
                  className="h-7 rounded-full px-3 text-[11px]"
                  onClick={() => reportState.setExportFormat(ReportExportFormatEnum.CSV)}
                >
                  {FLM1_DAILY_CN_SUMMARY_TEXT.csv}
                </Button>
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  void reportState.downloadReport();
                }}
                disabled={!reportState.isReady || reportState.isLoadingReport}
              >
                {FLM1_DAILY_CN_SUMMARY_TEXT.download}
              </Button>
            </div>
          </div>

          {reportState.reportError && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
              {FLM1_DAILY_CN_SUMMARY_TEXT.loadError}
            </div>
          )}

          <Flm1DailyCnSummaryTable
            report={reportState.report}
            loading={reportState.isLoadingReport || reportState.isFetchingReport}
          />
        </section>
      )}
    </div>
  );
};

export default Flm1DailyCnSummaryView;
