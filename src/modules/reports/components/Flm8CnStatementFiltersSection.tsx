import { Button, Checkbox, Dropdown } from '@/components/ui';
import { FLM8_CN_STATEMENT_TEXT, Flm8ProfileTypeEnum } from '../constants/flm8CnStatementConstants';
import type { Flm8CnStatementFiltersState } from '../hooks/useFlm8CnStatementFilters';
import CheckboxFilterGroup from './CheckboxFilterGroup';
import ReportDatePresetFilter from './ReportDatePresetFilter';

interface Flm8CnStatementFiltersSectionProps {
  filters: Flm8CnStatementFiltersState;
}

const buildSelectionDescription = (count: number, total: number) => {
  if (total === 0) {
    return 'No options available';
  }

  return `${count} of ${total} selected`;
};

export const Flm8CnStatementFiltersSection = ({
  filters,
}: Flm8CnStatementFiltersSectionProps) => {
  const currentProductLabel =
    filters.productOptions.find(option => option.id === filters.productId)?.label ??
    FLM8_CN_STATEMENT_TEXT.selectProduct;
  const profileTypeOptions = [
    { id: Flm8ProfileTypeEnum.FFMC, label: FLM8_CN_STATEMENT_TEXT.ffmc },
    { id: Flm8ProfileTypeEnum.AD, label: FLM8_CN_STATEMENT_TEXT.ad },
  ];
  const currentProfileTypeLabel =
    profileTypeOptions.find(option => option.id === filters.profileType)?.label ??
    FLM8_CN_STATEMENT_TEXT.selectProfileType;
  const showApConnect = filters.profileType === Flm8ProfileTypeEnum.AD;

  return (
    <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
      <ReportDatePresetFilter
        value={filters.dateRange}
        onChange={nextValue => filters.setDateRange(nextValue)}
      />

      <div className="grid gap-3 xl:grid-cols-3">
        <CheckboxFilterGroup
          heading={FLM8_CN_STATEMENT_TEXT.branchHeading}
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

        <div className="space-y-1.5 rounded-md border border-slate-200 bg-white p-2 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
              {FLM8_CN_STATEMENT_TEXT.productHeading}
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
                        {FLM8_CN_STATEMENT_TEXT.selected}
                      </span>
                    ) : null}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        <div className="space-y-1.5 rounded-md border border-slate-200 bg-white p-2 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
              {FLM8_CN_STATEMENT_TEXT.profileTypeHeading}
            </div>
            <span className="text-[10px] text-text-tertiary">2 options</span>
          </div>

          <div className="rounded-md border border-slate-100 bg-slate-50 px-2 py-1.5">
            <Dropdown>
              <Dropdown.Trigger className="h-8 w-full rounded-md border border-slate-200 bg-white px-3 text-left text-[11px] font-medium text-text-primary shadow-none">
                {currentProfileTypeLabel}
              </Dropdown.Trigger>
              <Dropdown.Menu className="min-w-full">
                {profileTypeOptions.map(option => (
                  <Dropdown.Item
                    key={option.id}
                    onClick={() => {
                      filters.setProfileType(option.id);
                    }}
                    className="justify-between text-[11px]"
                  >
                    <span>{option.label}</span>
                    {filters.profileType === option.id ? (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-600">
                        {FLM8_CN_STATEMENT_TEXT.selected}
                      </span>
                    ) : null}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {showApConnect ? (
            <div className="flex items-start gap-2 rounded-md border border-slate-100 bg-slate-50 px-2 py-2">
              <Checkbox
                id="flm8-ap-connect"
                checked={filters.apConnect}
                onChange={checked => filters.setApConnect(checked)}
              />
              <label htmlFor="flm8-ap-connect" className="space-y-0.5">
                <div className="text-[11px] font-medium text-text-primary">
                  {FLM8_CN_STATEMENT_TEXT.apConnectHeading}
                </div>
                <div className="text-[10px] text-text-secondary">
                  {FLM8_CN_STATEMENT_TEXT.apConnectHint}
                </div>
              </label>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-2">
        <div className="text-[11px] text-text-secondary">
          {FLM8_CN_STATEMENT_TEXT.selectProductHint}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={filters.resetFilters}
            className="h-8 px-3 text-xs"
          >
            {FLM8_CN_STATEMENT_TEXT.reset}
          </Button>
          <Button
            type="button"
            onClick={filters.handleView}
            className="h-8 px-3 text-xs"
            disabled={!filters.canView}
          >
            {FLM8_CN_STATEMENT_TEXT.viewReport}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Flm8CnStatementFiltersSection;
