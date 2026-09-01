import { Button } from '@/components/ui';
import type { CurrencyBalanceReportFiltersState } from '../hooks/useCurrencyBalanceReportFilters';
import CheckboxFilterGroup from './CheckboxFilterGroup';
import ReportDatePresetFilter from './ReportDatePresetFilter';

interface CurrencyBalanceReportFiltersSectionProps {
  filters: CurrencyBalanceReportFiltersState;
}

const buildSelectionDescription = (count: number, total: number) => {
  if (total === 0) {
    return 'No options available';
  }

  return `${count} of ${total} selected`;
};

export const CurrencyBalanceReportFiltersSection = ({
  filters,
}: CurrencyBalanceReportFiltersSectionProps) => {
  return (
    <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
      <ReportDatePresetFilter
        value={filters.dateRange}
        onChange={nextValue => filters.setDateRange(nextValue)}
      />

      <div className="grid gap-3 xl:grid-cols-3">
        <CheckboxFilterGroup
          heading="Branch"
          options={filters.branchOptions}
          selectedIds={filters.branchIds}
          allSelected={filters.branchAllSelected}
          onToggle={filters.toggleBranch}
          onToggleAll={filters.toggleAllBranches}
          emptyMessage="No branch options available."
          helperText={buildSelectionDescription(
            filters.branchIds.length,
            filters.branchOptions.length
          )}
        />

        <CheckboxFilterGroup
          heading="Counter"
          options={filters.counterOptions}
          selectedIds={filters.counterIds}
          allSelected={filters.counterAllSelected}
          onToggle={filters.toggleCounter}
          onToggleAll={filters.toggleAllCounters}
          emptyMessage="Select a branch first."
          helperText={buildSelectionDescription(
            filters.counterIds.length,
            filters.counterOptions.length
          )}
          disabled={filters.branchIds.length === 0}
        />

        <CheckboxFilterGroup
          heading="Currency"
          options={filters.currencyOptions}
          selectedIds={filters.currencyIds}
          allSelected={filters.currencyAllSelected}
          onToggle={filters.toggleCurrency}
          onToggleAll={filters.toggleAllCurrencies}
          emptyMessage="No currency options available."
          helperText={buildSelectionDescription(
            filters.currencyIds.length,
            filters.currencyOptions.length
          )}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-2">
        <div className="text-[11px] text-text-secondary">
          Leave branch, counter, or currency unselected to include all options.
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={filters.resetFilters}
            className="h-8 px-3 text-xs"
          >
            Reset
          </Button>
          <Button
            type="button"
            onClick={filters.handleView}
            className="h-8 px-3 text-xs"
            disabled={!filters.canView}
          >
            View Report
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CurrencyBalanceReportFiltersSection;
