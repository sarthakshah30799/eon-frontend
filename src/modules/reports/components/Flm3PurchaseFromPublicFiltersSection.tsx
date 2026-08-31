import { Button, Dropdown } from '@/components/ui';
import { FLM3_PURCHASE_FROM_PUBLIC_TEXT } from '../constants/flm3PurchaseFromPublicConstants';
import type { Flm3PurchaseFromPublicFiltersState } from '../hooks/useFlm3PurchaseFromPublicFilters';
import CheckboxFilterGroup from './CheckboxFilterGroup';
import ReportDatePresetFilter from './ReportDatePresetFilter';

interface Flm3PurchaseFromPublicFiltersSectionProps {
  filters: Flm3PurchaseFromPublicFiltersState;
}

const buildSelectionDescription = (count: number, total: number) => {
  if (total === 0) {
    return 'No options available';
  }

  return `${count} of ${total} selected`;
};

export const Flm3PurchaseFromPublicFiltersSection = ({
  filters,
}: Flm3PurchaseFromPublicFiltersSectionProps) => {
  const currentProductLabel =
    filters.productOptions.find(option => option.id === filters.productId)
      ?.label ?? FLM3_PURCHASE_FROM_PUBLIC_TEXT.selectProduct;

  return (
    <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
      <ReportDatePresetFilter
        value={filters.dateRange}
        onChange={nextValue => filters.setDateRange(nextValue)}
      />

      <div className="grid gap-3 xl:grid-cols-2">
        <CheckboxFilterGroup
          heading={FLM3_PURCHASE_FROM_PUBLIC_TEXT.branchHeading}
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

        <div className="space-y-1.5 rounded-md border border-slate-200 bg-white p-2 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
              {FLM3_PURCHASE_FROM_PUBLIC_TEXT.productHeading}
            </div>
            <span className="text-[10px] text-text-tertiary">1 option</span>
          </div>

          <div className="rounded-md border border-slate-100 bg-slate-50 px-2 py-1.5">
            <Dropdown>
              <Dropdown.Trigger className="h-8 w-full rounded-md border border-slate-200 bg-white px-3 text-left text-[11px] font-medium text-text-primary shadow-none">
                {currentProductLabel}
              </Dropdown.Trigger>
              <Dropdown.Menu className="min-w-full">
                {filters.productOptions.map(option => (
                  <Dropdown.Item
                    key={option.id}
                    onClick={() => {
                      filters.setProductId(option.id);
                    }}
                    className="justify-between text-[11px]"
                  >
                    <span>{option.label}</span>
                    {filters.productId === option.id ? (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-600">
                        {FLM3_PURCHASE_FROM_PUBLIC_TEXT.selected}
                      </span>
                    ) : null}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-2">
        <div className="text-[11px] text-text-secondary">
          {FLM3_PURCHASE_FROM_PUBLIC_TEXT.selectProductHint}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={filters.resetFilters}
            className="h-8 px-3 text-xs"
          >
            {FLM3_PURCHASE_FROM_PUBLIC_TEXT.reset}
          </Button>
          <Button
            type="button"
            onClick={filters.handleView}
            className="h-8 px-3 text-xs"
            disabled={!filters.canView}
          >
            {FLM3_PURCHASE_FROM_PUBLIC_TEXT.viewReport}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Flm3PurchaseFromPublicFiltersSection;
