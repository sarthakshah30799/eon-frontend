import { useMemo } from 'react';
import { Button } from '@/components/ui';
import { AccessDeniedState } from '@/components/ui/access-denied-state';
import { PAGE_STATUS_TEXTS } from '@/constants';
import { useAuth } from '@/lib/AuthContext';
import { TtReportFiltersSection, TtReportTable } from '../components';
import { TT_REPORT_TEXT_BY_LAYOUT } from '../constants/ttReportConstants';
import { useTtReport } from '../hooks';
import { ReportExportFormatEnum, type TtReportLayout } from '../types';
import { summarizeReportSelection } from '../utils';

export const TtReportView = ({
  layout = 'indus',
}: {
  layout?: TtReportLayout;
}) => {
  const text = TT_REPORT_TEXT_BY_LAYOUT[layout];
  const { user } = useAuth();
  const reportState = useTtReport(layout);

  const branchSummary = useMemo(
    () =>
      summarizeReportSelection(
        reportState.filters.appliedFilters?.branchIds ?? [],
        reportState.filters.branchOptions
      ),
    [
      reportState.filters.appliedFilters?.branchIds,
      reportState.filters.branchOptions,
    ]
  );
  const productLabel =
    reportState.filters.productOptions.find(
      option => option.id === reportState.filters.appliedFilters?.productId
    )?.label ?? text.all;
  const issuerSummary = useMemo(
    () =>
      summarizeReportSelection(
        reportState.filters.appliedFilters?.issuerPartyProfileIds ?? [],
        reportState.filters.issuerOptions
      ),
    [
      reportState.filters.appliedFilters?.issuerPartyProfileIds,
      reportState.filters.issuerOptions,
    ]
  );

  if (!user) {
    return (
      <AccessDeniedState message={PAGE_STATUS_TEXTS.ACCESS_DENIED_MESSAGE} />
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-text-primary">
          {text.title}
        </h1>
        <p className="max-w-3xl text-[11px] text-text-secondary">
          {text.description}
        </p>
      </div>

      <TtReportFiltersSection filters={reportState.filters} />

      {reportState.filters.appliedFilters && (
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-text-secondary">
          {text.appliedPrefix}: {reportState.appliedDateRangeLabel} |{' '}
          {text.branchHeading}{' '}
          {branchSummary.length ? branchSummary.join(', ') : text.all} |{' '}
          {text.productHeading} {productLabel} | {text.issuerHeading}{' '}
          {issuerSummary.length ? issuerSummary.join(', ') : text.allIssuers}
        </div>
      )}

      {reportState.filters.appliedFilters && (
        <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-text-primary">
              {text.reportViewTitle}
            </h2>
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
                  onClick={() =>
                    reportState.setExportFormat(ReportExportFormatEnum.XLSX)
                  }
                >
                  {text.xlsx}
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
                  onClick={() =>
                    reportState.setExportFormat(ReportExportFormatEnum.CSV)
                  }
                >
                  {text.csv}
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
                {text.download}
              </Button>
            </div>
          </div>

          {reportState.reportError && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
              {text.loadError}
            </div>
          )}

          <TtReportTable
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

export default TtReportView;
