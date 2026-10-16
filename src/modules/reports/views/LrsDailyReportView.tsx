import { useMemo } from 'react';
import { Button } from '@/components/ui';
import { AccessDeniedState } from '@/components/ui/access-denied-state';
import { PAGE_STATUS_TEXTS } from '@/constants';
import { useAuth } from '@/lib/AuthContext';
import {
  LrsDailyReportFiltersSection,
  LrsDailyReportTable,
} from '../components';
import { LRS_DAILY_REPORT_TEXT } from '../constants/lrsDailyReportConstants';
import { useLrsDailyReport } from '../hooks';
import {
  LrsDailyReportExportFormatEnum,
  LrsDailyReportFormatEnum,
} from '../types';
import { summarizeReportSelection } from '../utils';

export const LrsDailyReportView = () => {
  const { user } = useAuth();
  const reportState = useLrsDailyReport();
  const canView = Boolean(user);

  const currentSummary = useMemo(() => {
    const branchLabels = summarizeReportSelection(
      reportState.filters.branchIds,
      reportState.filters.branchOptions
    );
    const productLabel =
      reportState.filters.productOptions.find(
        option => option.id === reportState.filters.productId
      )?.label ?? LRS_DAILY_REPORT_TEXT.allProducts;

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
    return (
      <AccessDeniedState message={PAGE_STATUS_TEXTS.ACCESS_DENIED_MESSAGE} />
    );
  }

  const appliedFormat =
    reportState.filters.appliedFilters?.reportFormat ===
    LrsDailyReportFormatEnum.CIMS_UPLOAD
      ? LRS_DAILY_REPORT_TEXT.cimsUploadFormat
      : LRS_DAILY_REPORT_TEXT.cimsFormat;

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-text-primary">
          {LRS_DAILY_REPORT_TEXT.title}
        </h1>
        <p className="max-w-3xl text-[11px] text-text-secondary">
          {LRS_DAILY_REPORT_TEXT.description}
        </p>
      </div>

      <LrsDailyReportFiltersSection filters={reportState.filters} />

      {reportState.filters.appliedFilters && (
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-text-secondary">
          {LRS_DAILY_REPORT_TEXT.appliedPrefix}:{' '}
          {reportState.appliedDateRangeLabel} |{' '}
          {LRS_DAILY_REPORT_TEXT.branchHeading}{' '}
          {currentSummary.branches.length
            ? currentSummary.branches.join(', ')
            : LRS_DAILY_REPORT_TEXT.all}{' '}
          | {LRS_DAILY_REPORT_TEXT.productHeading} {currentSummary.product} |{' '}
          {appliedFormat}
        </div>
      )}

      {reportState.filters.appliedFilters && (
        <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h2 className="text-sm font-semibold text-text-primary">
                {LRS_DAILY_REPORT_TEXT.reportViewTitle}
              </h2>
              <p className="text-[11px] text-text-secondary">
                {LRS_DAILY_REPORT_TEXT.reportViewDescription}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  void reportState.downloadReport(
                    LrsDailyReportExportFormatEnum.XLSX
                  );
                }}
                disabled={!reportState.isReady || reportState.isLoadingReport}
              >
                {LRS_DAILY_REPORT_TEXT.excel}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  void reportState.downloadReport(
                    LrsDailyReportExportFormatEnum.PDF
                  );
                }}
                disabled={!reportState.isReady || reportState.isLoadingReport}
              >
                {LRS_DAILY_REPORT_TEXT.pdf}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  void reportState.downloadReport(
                    LrsDailyReportExportFormatEnum.TXT
                  );
                }}
                disabled={!reportState.isReady || reportState.isLoadingReport}
              >
                {LRS_DAILY_REPORT_TEXT.txt}
              </Button>
            </div>
          </div>

          {reportState.reportError && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
              {LRS_DAILY_REPORT_TEXT.loadError}
            </div>
          )}

          {reportState.downloadError && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
              {reportState.downloadError}
            </div>
          )}

          <LrsDailyReportTable
            report={reportState.report}
            loading={
              reportState.isLoadingReport || reportState.isFetchingReport
            }
          />
        </section>
      )}
    </div>
  );
};

export default LrsDailyReportView;
