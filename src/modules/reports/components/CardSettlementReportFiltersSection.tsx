import { Button } from '@/components/ui';
import { CARD_SETTLEMENT_REPORT_TEXT } from '../constants/cardSettlementReportConstants';
import type { CardSettlementReportFilters } from '../hooks/useCardSettlementReportFilters';
import CheckboxFilterGroup from './CheckboxFilterGroup';
import ReportDatePresetFilter from './ReportDatePresetFilter';
import ReportSortByFilter from './ReportSortByFilter';

interface CardSettlementReportFiltersSectionProps {
  filters: CardSettlementReportFilters;
}

const buildSelectionDescription = (count: number, total: number) => {
  if (total === 0) {
    return CARD_SETTLEMENT_REPORT_TEXT.noOptions;
  }

  return CARD_SETTLEMENT_REPORT_TEXT.selectedOf(count, total);
};

export const CardSettlementReportFiltersSection = ({
  filters,
}: CardSettlementReportFiltersSectionProps) => {
  return (
    <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
      <ReportDatePresetFilter
        value={filters.dateRange}
        onChange={nextValue => filters.setDateRange(nextValue)}
        showAllDates
      />

      <ReportSortByFilter value={filters.sortBy} onChange={filters.setSortBy} />

      <div className="grid gap-3 xl:grid-cols-2">
        <CheckboxFilterGroup
          heading={CARD_SETTLEMENT_REPORT_TEXT.branchHeading}
          options={filters.branchOptions}
          selectedIds={filters.branchIds}
          allSelected={filters.branchAllSelected}
          onToggle={filters.toggleBranch}
          onToggleAll={filters.toggleAllBranches}
          emptyMessage={CARD_SETTLEMENT_REPORT_TEXT.branchEmpty}
          helperText={buildSelectionDescription(
            filters.branchIds.length,
            filters.branchOptions.length
          )}
          isLoading={filters.isLoadingBranches}
          loadingMessage={CARD_SETTLEMENT_REPORT_TEXT.loadingOptions}
        />

        <CheckboxFilterGroup
          heading={CARD_SETTLEMENT_REPORT_TEXT.productHeading}
          options={filters.productOptions}
          selectedIds={filters.productIds}
          allSelected={filters.productAllSelected}
          onToggle={filters.toggleProduct}
          onToggleAll={filters.toggleAllProducts}
          emptyMessage={CARD_SETTLEMENT_REPORT_TEXT.productEmpty}
          helperText={buildSelectionDescription(
            filters.productIds.length,
            filters.productOptions.length
          )}
          isLoading={filters.isLoadingProducts}
          loadingMessage={CARD_SETTLEMENT_REPORT_TEXT.loadingOptions}
        />

        <CheckboxFilterGroup
          heading={CARD_SETTLEMENT_REPORT_TEXT.currencyHeading}
          options={filters.currencyOptions}
          selectedIds={filters.currencyIds}
          allSelected={filters.currencyAllSelected}
          onToggle={filters.toggleCurrency}
          onToggleAll={filters.toggleAllCurrencies}
          emptyMessage={CARD_SETTLEMENT_REPORT_TEXT.currencyEmpty}
          helperText={buildSelectionDescription(
            filters.currencyIds.length,
            filters.currencyOptions.length
          )}
          isLoading={filters.isLoadingCurrencies}
          loadingMessage={CARD_SETTLEMENT_REPORT_TEXT.loadingOptions}
        />

        <CheckboxFilterGroup
          heading={CARD_SETTLEMENT_REPORT_TEXT.issuerHeading}
          options={filters.issuerOptions}
          selectedIds={filters.issuerPartyProfileIds}
          allSelected={filters.issuerAllSelected}
          onToggle={filters.toggleIssuer}
          onToggleAll={filters.toggleAllIssuers}
          emptyMessage={CARD_SETTLEMENT_REPORT_TEXT.issuerEmpty}
          helperText={buildSelectionDescription(
            filters.issuerPartyProfileIds.length,
            filters.issuerOptions.length
          )}
          isLoading={filters.isLoadingIssuers}
          loadingMessage={CARD_SETTLEMENT_REPORT_TEXT.loadingOptions}
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={filters.resetFilters}
          className="h-8 px-3 text-xs"
        >
          {CARD_SETTLEMENT_REPORT_TEXT.reset}
        </Button>
        <Button
          type="button"
          onClick={filters.handleView}
          className="h-8 px-3 text-xs"
        >
          {CARD_SETTLEMENT_REPORT_TEXT.viewReport}
        </Button>
      </div>
    </section>
  );
};

export default CardSettlementReportFiltersSection;
