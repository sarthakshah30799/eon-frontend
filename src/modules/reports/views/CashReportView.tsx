import { useMemo } from 'react';
import { Button } from '@/components/ui';
import { AccessDeniedState } from '@/components/ui/access-denied-state';
import { PAGE_STATUS_TEXTS } from '@/constants';
import { useAuth } from '@/lib/AuthContext';
import {
  CashReportFiltersSection,
  CashReportTable,
} from '../components';
import { useCashReport } from '../hooks';
import { CashReportLayoutEnum, ReportExportFormatEnum } from '../types';
import { summarizeReportSelection } from '../utils';

export const CashReportView = () => {
  const { user } = useAuth();
  const report = useCashReport();
  const canView = Boolean(user);

  const currentSummary = useMemo(() => {
    const branchLabels = summarizeReportSelection(
      report.filters.branchIds,
      report.filters.branchOptions
    );
    const accountLabels = summarizeReportSelection(
      report.filters.accountIds,
      report.filters.accountOptions
    );

    return {
      branches: branchLabels,
      accounts: accountLabels,
      layout:
        report.filters.layout === CashReportLayoutEnum.CONSOLIDATED
          ? 'Consolidated'
          : 'Branch wise',
    };
  }, [
    report.filters.accountIds,
    report.filters.accountOptions,
    report.filters.branchIds,
    report.filters.branchOptions,
    report.filters.layout,
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
          Cash Report
        </h1>
        <p className="max-w-3xl text-[11px] text-text-secondary">
          Cash ledger movements from receipt/payment/deposit-withdrawal
          vouchers and purchase/sale cash payments, with OP/CI/CO/CL types,
          opening and closing rows, summary totals, and CSV/XLSX export.
        </p>
      </div>

      <CashReportFiltersSection filters={report.filters} />

      {report.filters.appliedFilters && (
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-text-secondary">
          Applied: {report.appliedDateRangeLabel} | Layout{' '}
          {currentSummary.layout} | Branches{' '}
          {currentSummary.branches.length
            ? currentSummary.branches.join(', ')
            : 'All'}{' '}
          | Accounts{' '}
          {currentSummary.accounts.length
            ? currentSummary.accounts.join(', ')
            : 'All'}
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
                First and last rows are Opening (OP) and Closing (CL). Mid-rows
                use Receipt (CI) / Payment (CO). Summary totals follow each
                section.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="rounded-md border border-border-primary bg-white px-2 py-1 text-[11px]"
                value={report.exportFormat}
                onChange={event =>
                  report.setExportFormat(
                    event.target.value === ReportExportFormatEnum.CSV
                      ? ReportExportFormatEnum.CSV
                      : ReportExportFormatEnum.XLSX
                  )
                }
              >
                <option value={ReportExportFormatEnum.XLSX}>Excel</option>
                <option value={ReportExportFormatEnum.CSV}>CSV</option>
              </select>
              <Button
                type="button"
                variant="outline"
                onClick={() => void report.downloadReport()}
                disabled={
                  report.isLoadingReport || report.isFetchingReport
                }
              >
                Export
              </Button>
            </div>
          </div>

          {report.reportError && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
              Failed to load report data. Please try again.
            </div>
          )}

          <CashReportTable
            columns={report.reportColumns}
            sections={report.reportSections}
            loading={report.isLoadingReport || report.isFetchingReport}
          />
        </section>
      )}
    </div>
  );
};

export default CashReportView;
