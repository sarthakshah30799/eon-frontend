import { Button, Dropdown } from '@/components/ui';
import { FLM6_SALES_TO_FFMC_TEXT } from '../constants/flm6SalesToFfmcConstants';
import type { Flm6SalesToFfmcFiltersState } from '../hooks/useFlm6SalesToFfmcFilters';
import CheckboxFilterGroup from './CheckboxFilterGroup';
import ReportDatePresetFilter from './ReportDatePresetFilter';

interface Flm6SalesToFfmcFiltersSectionProps {
  filters: Flm6SalesToFfmcFiltersState;
}

const buildSelectionDescription = (count: number, total: number) => {
  if (total === 0) {
    return 'No options available';
  }

  return `${count} of ${total} selected`;
};

export const Flm6SalesToFfmcFiltersSection = ({
  filters,
}: Flm6SalesToFfmcFiltersSectionProps) => {
  const currentProductLabel =
    filters.productOptions.find(option => option.id === filters.productId)?.label ??
    FLM6_SALES_TO_FFMC_TEXT.selectProduct;

  return (
    <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
      <ReportDatePresetFilter
        value={filters.dateRange}
        onChange={nextValue => filters.setDateRange(nextValue)}
      />

      <div className="grid gap-3 xl:grid-cols-3">
        <CheckboxFilterGroup
          heading={FLM6_SALES_TO_FFMC_TEXT.branchHeading}
          options={filters.branchOptions}
          selectedIds={filters.branchIds}
          allSelected={filters.branchAllSelected}
          onToggle={filters.toggleBranch}
          onToggleAll={filters.toggleAllBranches}
          emptyMessage="No branch options available."
          helperText={buildSelectionDescription(
            filters.branchIds.length,
            filters.branchOptions.length,
          )}
        />

        <CheckboxFilterGroup
          heading={FLM6_SALES_TO_FFMC_TEXT.profileHeading}
          options={filters.profileOptions}
          selectedIds={filters.profileTypes}
          allSelected={filters.profileAllSelected}
          onToggle={filters.toggleProfile}
          onToggleAll={filters.toggleAllProfiles}
          emptyMessage="No profile options available."
          helperText={
            filters.profileAllSelected
              ? FLM6_SALES_TO_FFMC_TEXT.all
              : buildSelectionDescription(
                  filters.profileTypes.length,
                  filters.profileOptions.length,
                )
          }
        />

        <div className="space-y-1.5 rounded-md border border-slate-200 bg-white p-2 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
              {FLM6_SALES_TO_FFMC_TEXT.productHeading}
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
                        {FLM6_SALES_TO_FFMC_TEXT.selected}
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
          {FLM6_SALES_TO_FFMC_TEXT.selectProductHint}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={filters.resetFilters}
            className="h-8 px-3 text-xs"
          >
            {FLM6_SALES_TO_FFMC_TEXT.reset}
          </Button>
          <Button
            type="button"
            onClick={filters.handleView}
            className="h-8 px-3 text-xs"
            disabled={!filters.canView}
          >
            {FLM6_SALES_TO_FFMC_TEXT.viewReport}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Flm6SalesToFfmcFiltersSection;
