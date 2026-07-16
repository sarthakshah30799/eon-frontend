import { useMemo } from 'react';
import { Button } from '@/components/ui';
import { useAuth } from '@/lib/AuthContext';
import { CheckboxFilterGroup, ReportCommonFiltersSection, SalePurchaseReportTable } from '../components';
import { useProductProfitReport } from '../hooks';
import { ReportExportFormatEnum } from '../types';
import { summarizeReportSelection } from '../utils';

const buildSelectionDescription = (count: number, total: number) => {
  if (total === 0) {
    return 'No options available';
  }

  return `${count} of ${total} selected`;
};

export const ProductProfitReportView = () => {
  const { user } = useAuth();
  const report = useProductProfitReport();
  const canView = Boolean(user);

  const currentSummary = useMemo(() => {
    const stateLabels = summarizeReportSelection(report.filters.stateIds, report.filters.stateOptions);
    const branchLabels = summarizeReportSelection(report.filters.branchIds, report.filters.branchOptions);
    const counterLabels = summarizeReportSelection(report.filters.counterIds, report.filters.counterOptions);
    const typeLabels = summarizeReportSelection(report.filters.partyTypeCodes, report.filters.partyTypeOptions);
    const currencyLabels = summarizeReportSelection(report.filters.currencyIds, report.filters.currencyOptions);
    const productLabels = summarizeReportSelection(report.filters.productIds, report.filters.productOptions);

    return {
      states: stateLabels,
      branches: branchLabels,
      counters: counterLabels,
      types: typeLabels,
      currencies: currencyLabels,
      products: productLabels,
    };
  }, [
    report.filters.branchIds,
    report.filters.branchOptions,
    report.filters.counterIds,
    report.filters.counterOptions,
    report.filters.currencyIds,
    report.filters.currencyOptions,
    report.filters.partyTypeCodes,
    report.filters.partyTypeOptions,
    report.filters.productIds,
    report.filters.productOptions,
    report.filters.stateIds,
    report.filters.stateOptions,
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
          Product Profit Reports
        </h1>
        <p className="max-w-3xl text-[11px] text-text-secondary">
          Single-form product profit reporting with currency and product filters, plus CSV/XLSX
          export.
        </p>
      </div>

      <ReportCommonFiltersSection
        filters={report.filters}
        showTransactionTypeFilter={false}
        extraFilters={
          <div className="grid gap-3 xl:grid-cols-2">
            <CheckboxFilterGroup
              heading="Currency"
              options={report.filters.currencyOptions}
              selectedIds={report.filters.currencyIds}
              allSelected={report.filters.currencyAllSelected}
              onToggle={report.filters.toggleCurrency}
              onToggleAll={report.filters.toggleAllCurrencies}
              emptyMessage="No currency options available."
              helperText={buildSelectionDescription(
                report.filters.currencyIds.length,
                report.filters.currencyOptions.length,
              )}
            />

            <CheckboxFilterGroup
              heading="Product"
              options={report.filters.productOptions}
              selectedIds={report.filters.productIds}
              allSelected={report.filters.productAllSelected}
              onToggle={report.filters.toggleProduct}
              onToggleAll={report.filters.toggleAllProducts}
              emptyMessage="No product options available."
              helperText={buildSelectionDescription(
                report.filters.productIds.length,
                report.filters.productOptions.length,
              )}
            />
          </div>
        }
      />

      {report.filters.appliedFilters && (
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-text-secondary">
          Applied: {report.appliedDateRangeLabel} | States{' '}
          {currentSummary.states.length ? currentSummary.states.join(', ') : 'All'} | Branches{' '}
          {currentSummary.branches.length ? currentSummary.branches.join(', ') : 'All'} | Counters{' '}
          {currentSummary.counters.length ? currentSummary.counters.join(', ') : 'All'} | Party Types{' '}
          {currentSummary.types.length ? currentSummary.types.join(', ') : 'All'} | Currency{' '}
          {currentSummary.currencies.length ? currentSummary.currencies.join(', ') : 'All'} | Product{' '}
          {currentSummary.products.length ? currentSummary.products.join(', ') : 'All'}
        </div>
      )}

      {report.filters.appliedFilters && (
        <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h2 className="text-sm font-semibold text-text-primary">Report View</h2>
              <p className="text-[11px] text-text-secondary">
                One row per matched transaction item, with a subtotal row at the end.
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

export default ProductProfitReportView;
