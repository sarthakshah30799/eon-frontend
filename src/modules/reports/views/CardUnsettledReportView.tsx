import { useMemo } from 'react';
import { Button } from '@/components/ui';
import { AccessDeniedState } from '@/components/ui/access-denied-state';
import { PAGE_STATUS_TEXTS } from '@/constants';
import { useAuth } from '@/lib/AuthContext';
import {
  CardSettlementReportFiltersSection,
  SalePurchaseReportTable,
} from '../components';
import { CARD_SETTLEMENT_REPORT_TEXT } from '../constants/cardSettlementReportConstants';
import { useCardUnsettledReport } from '../hooks';
import { ReportExportFormatEnum, ReportSortByEnum } from '../types';
import { summarizeReportSelection } from '../utils';

export const CardUnsettledReportView = () => {
  const { user } = useAuth();
  const report = useCardUnsettledReport();
  const canView = Boolean(user);

  const currentSummary = useMemo(() => {
    const branchLabels = summarizeReportSelection(
      report.filters.branchIds,
      report.filters.branchOptions,
    );
    const productLabels = summarizeReportSelection(
      report.filters.productIds,
      report.filters.productOptions,
    );
    const currencyLabels = summarizeReportSelection(
      report.filters.currencyIds,
      report.filters.currencyOptions,
    );
    const issuerLabels = summarizeReportSelection(
      report.filters.issuerPartyProfileIds,
      report.filters.issuerOptions,
    );
    const sortLabel =
      report.filters.sortBy === ReportSortByEnum.DATE_DESC
        ? CARD_SETTLEMENT_REPORT_TEXT.dateDesc
        : CARD_SETTLEMENT_REPORT_TEXT.dateAsc;

    return {
      branches: branchLabels,
      products: productLabels,
      currencies: currencyLabels,
      issuers: issuerLabels,
      sortLabel,
    };
  }, [
    report.filters.branchIds,
    report.filters.branchOptions,
    report.filters.currencyIds,
    report.filters.currencyOptions,
    report.filters.issuerOptions,
    report.filters.issuerPartyProfileIds,
    report.filters.productIds,
    report.filters.productOptions,
    report.filters.sortBy,
  ]);

  if (!canView) {
    return <AccessDeniedState message={PAGE_STATUS_TEXTS.ACCESS_DENIED_MESSAGE} />;
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-text-primary">
          {CARD_SETTLEMENT_REPORT_TEXT.unsettledTitle}
        </h1>
        <p className="max-w-3xl text-[11px] text-text-secondary">
          {CARD_SETTLEMENT_REPORT_TEXT.unsettledDescription}
        </p>
      </div>

      <CardSettlementReportFiltersSection filters={report.filters} />

      {report.filters.appliedFilters && (
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-text-secondary">
          {CARD_SETTLEMENT_REPORT_TEXT.appliedPrefix}: {report.appliedDateRangeLabel} |{' '}
          {CARD_SETTLEMENT_REPORT_TEXT.branchHeading}{' '}
          {currentSummary.branches.length
            ? currentSummary.branches.join(', ')
            : CARD_SETTLEMENT_REPORT_TEXT.all}{' '}
          | {CARD_SETTLEMENT_REPORT_TEXT.productHeading}{' '}
          {currentSummary.products.length
            ? currentSummary.products.join(', ')
            : CARD_SETTLEMENT_REPORT_TEXT.all}{' '}
          | {CARD_SETTLEMENT_REPORT_TEXT.currencyHeading}{' '}
          {currentSummary.currencies.length
            ? currentSummary.currencies.join(', ')
            : CARD_SETTLEMENT_REPORT_TEXT.all}{' '}
          | {CARD_SETTLEMENT_REPORT_TEXT.issuerHeading}{' '}
          {currentSummary.issuers.length
            ? currentSummary.issuers.join(', ')
            : CARD_SETTLEMENT_REPORT_TEXT.all}{' '}
          | {CARD_SETTLEMENT_REPORT_TEXT.sortBy} {currentSummary.sortLabel}
        </div>
      )}

      {report.filters.appliedFilters && (
        <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h2 className="text-sm font-semibold text-text-primary">
                {CARD_SETTLEMENT_REPORT_TEXT.reportViewTitle}
              </h2>
              <p className="text-[11px] text-text-secondary">
                {CARD_SETTLEMENT_REPORT_TEXT.reportViewDescription}
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
                  {CARD_SETTLEMENT_REPORT_TEXT.xlsx}
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
                  {CARD_SETTLEMENT_REPORT_TEXT.csv}
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
                {CARD_SETTLEMENT_REPORT_TEXT.download}
              </Button>
            </div>
          </div>

          {report.reportError && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
              {CARD_SETTLEMENT_REPORT_TEXT.loadError}
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

export default CardUnsettledReportView;
