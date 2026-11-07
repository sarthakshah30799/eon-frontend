import { useMemo } from 'react';
import { Button } from '@/components/ui';
import { AccessDeniedState } from '@/components/ui/access-denied-state';
import { PAGE_STATUS_TEXTS } from '@/constants';
import { useAuth } from '@/lib/AuthContext';
import {
  GeneralLedgerColumnarTable,
  GeneralLedgerReportTable,
  SubLedgerReportFiltersSection,
} from '../components';
import {
  SUB_LEDGER_REPORT_TEXT,
  SubLedgerReportViewEnum,
} from '../constants/subLedgerReportConstants';
import { useSubLedgerReport } from '../hooks';
import { ReportExportFormatEnum } from '../types';
import { summarizeReportSelection } from '../utils';

export const SubLedgerReportView = () => {
  const { user } = useAuth();
  const reportState = useSubLedgerReport();
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
  const typeSummary = useMemo(
    () =>
      summarizeReportSelection(
        reportState.filters.appliedFilters?.accountIds ?? [],
        reportState.filters.accountOptions
      ),
    [
      reportState.filters.appliedFilters?.accountIds,
      reportState.filters.accountOptions,
    ]
  );
  const isColumnar =
    reportState.filters.appliedFilters?.view ===
    SubLedgerReportViewEnum.COLUMNAR;

  if (!user) {
    return (
      <AccessDeniedState message={PAGE_STATUS_TEXTS.ACCESS_DENIED_MESSAGE} />
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-text-primary">
          {SUB_LEDGER_REPORT_TEXT.title}
        </h1>
        <p className="max-w-3xl text-[11px] text-text-secondary">
          {SUB_LEDGER_REPORT_TEXT.description}
        </p>
      </div>
      <SubLedgerReportFiltersSection filters={reportState.filters} />
      {reportState.filters.appliedFilters && (
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-text-secondary">
          {SUB_LEDGER_REPORT_TEXT.appliedPrefix}:{' '}
          {reportState.appliedDateRangeLabel} |{' '}
          {SUB_LEDGER_REPORT_TEXT.branchHeading}{' '}
          {branchSummary.length
            ? branchSummary.join(', ')
            : SUB_LEDGER_REPORT_TEXT.all}{' '}
          | {SUB_LEDGER_REPORT_TEXT.accountHeading}{' '}
          {reportState.filters.subLedgerLabel} |{' '}
          {SUB_LEDGER_REPORT_TEXT.typeHeading}{' '}
          {typeSummary.length
            ? typeSummary.join(', ')
            : SUB_LEDGER_REPORT_TEXT.all}{' '}
          | {SUB_LEDGER_REPORT_TEXT.passengerHeading}{' '}
          {reportState.filters.appliedFilters?.passengerName ||
            SUB_LEDGER_REPORT_TEXT.all}{' '}
          | {SUB_LEDGER_REPORT_TEXT.layoutHeading}{' '}
          {reportState.filters.layoutLabel} |{' '}
          {SUB_LEDGER_REPORT_TEXT.scopeHeading}{' '}
          {reportState.filters.scopeLabel} | View{' '}
          {isColumnar ? 'Columnar' : 'Ledger'}
        </div>
      )}
      {reportState.filters.appliedFilters && (
        <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-text-primary">
              {SUB_LEDGER_REPORT_TEXT.reportViewTitle}
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
                  {SUB_LEDGER_REPORT_TEXT.xlsx}
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
                  {SUB_LEDGER_REPORT_TEXT.csv}
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
                {SUB_LEDGER_REPORT_TEXT.download}
              </Button>
            </div>
          </div>
          {reportState.reportError && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
              {SUB_LEDGER_REPORT_TEXT.loadError}
            </div>
          )}
          {isColumnar ? (
            <GeneralLedgerColumnarTable
              report={reportState.report}
              loading={
                reportState.isLoadingReport || reportState.isFetchingReport
              }
            />
          ) : (
            <GeneralLedgerReportTable
              report={reportState.report}
              loading={
                reportState.isLoadingReport || reportState.isFetchingReport
              }
            />
          )}
        </section>
      )}
    </div>
  );
};

export default SubLedgerReportView;
