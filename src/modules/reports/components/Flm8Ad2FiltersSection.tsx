import { Button, Checkbox } from '@/components/ui';
import { FLM8_AD2_TEXT, Flm8Ad2ReportFormatEnum } from '../constants/flm8Ad2Constants';
import type { Flm8Ad2FiltersState } from '../hooks/useFlm8Ad2Filters';
import CheckboxFilterGroup from './CheckboxFilterGroup';
import ReportDatePresetFilter from './ReportDatePresetFilter';

interface Flm8Ad2FiltersSectionProps {
  filters: Flm8Ad2FiltersState;
}

const FORMAT_OPTIONS = [
  {
    id: Flm8Ad2ReportFormatEnum.CURRENCY,
    label: FLM8_AD2_TEXT.currencyDetails,
  },
  {
    id: Flm8Ad2ReportFormatEnum.PURPOSE,
    label: FLM8_AD2_TEXT.purposeDetails,
  },
  {
    id: Flm8Ad2ReportFormatEnum.PARTY,
    label: FLM8_AD2_TEXT.partyDetails,
  },
] as const;

const buildSelectionDescription = (count: number, total: number) => {
  if (total === 0) {
    return 'No options available';
  }
  return `${count} of ${total} selected`;
};

export const Flm8Ad2FiltersSection = ({
  filters,
}: Flm8Ad2FiltersSectionProps) => (
  <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
    <ReportDatePresetFilter
      value={filters.dateRange}
      onChange={filters.setDateRange}
    />

    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <CheckboxFilterGroup
        heading={FLM8_AD2_TEXT.branchHeading}
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

      <div className="space-y-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {FLM8_AD2_TEXT.reportFormatHeading}
        </div>
        <div className="space-y-2">
          {FORMAT_OPTIONS.map(option => (
            <label
              key={option.id}
              className="flex items-center gap-2 text-[12px] text-text-primary"
            >
              <input
                type="radio"
                name="flm8-ad2-report-format"
                className="h-4 w-4 border-border-secondary text-primary-600"
                checked={filters.reportFormat === option.id}
                onChange={() => filters.setReportFormat(option.id)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        <Checkbox
          id="flm8-ad2-ap-connect"
          checked={filters.apConnect}
          onChange={filters.setApConnect}
        >
          {FLM8_AD2_TEXT.apConnect}
        </Checkbox>
        <p className="text-[10px] text-text-tertiary">
          {FLM8_AD2_TEXT.apConnectHint}
        </p>
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        className="h-8 px-3 text-xs"
        onClick={filters.handleView}
        disabled={!filters.canView}
      >
        {FLM8_AD2_TEXT.view}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-8 px-3 text-xs"
        onClick={filters.resetFilters}
      >
        {FLM8_AD2_TEXT.reset}
      </Button>
    </div>
  </section>
);
