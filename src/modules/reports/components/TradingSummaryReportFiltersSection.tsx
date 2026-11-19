import { Button } from '@/components/ui';
import {
  TRADING_SUMMARY_REPORT_TEXT,
  TradingSummaryDiffFilterEnum,
  TradingSummaryReportScopeEnum,
} from '../constants/tradingSummaryReportConstants';
import type { TradingSummaryReportFiltersState } from '../hooks/useTradingSummaryReportFilters';
import CheckboxFilterGroup from './CheckboxFilterGroup';
import ReportDatePresetFilter from './ReportDatePresetFilter';

interface TradingSummaryReportFiltersSectionProps {
  filters: TradingSummaryReportFiltersState;
}

const scopeOptions = [
  {
    id: TradingSummaryReportScopeEnum.BRANCH,
    label: TRADING_SUMMARY_REPORT_TEXT.branchScope,
  },
  {
    id: TradingSummaryReportScopeEnum.CONSOLIDATED,
    label: TRADING_SUMMARY_REPORT_TEXT.consolidated,
  },
] as const;

const diffFilterOptions = [
  {
    id: TradingSummaryDiffFilterEnum.HAS_DIFF,
    label: TRADING_SUMMARY_REPORT_TEXT.hasDiff,
  },
  {
    id: TradingSummaryDiffFilterEnum.NO_DIFF,
    label: TRADING_SUMMARY_REPORT_TEXT.noDiff,
  },
] as const;

const RadioList = <T extends string>({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: T;
  options: ReadonlyArray<{ id: T; label: string }>;
  onChange: (value: T) => void;
}) => (
  <div className="space-y-2">
    {options.map(option => (
      <label
        key={option.id}
        className="flex items-center gap-2 text-[12px] text-text-primary"
      >
        <input
          type="radio"
          name={name}
          className="h-4 w-4 border-border-secondary text-primary-600"
          checked={value === option.id}
          onChange={() => onChange(option.id)}
        />
        <span>{option.label}</span>
      </label>
    ))}
  </div>
);

export const TradingSummaryReportFiltersSection = ({
  filters,
}: TradingSummaryReportFiltersSectionProps) => (
  <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
    <ReportDatePresetFilter
      value={filters.dateRange}
      onChange={filters.setDateRange}
    />
    <CheckboxFilterGroup
      heading={TRADING_SUMMARY_REPORT_TEXT.branchHeading}
      options={filters.branchOptions}
      selectedIds={filters.branchIds}
      allSelected={filters.branchAllSelected}
      onToggle={filters.toggleBranch}
      onToggleAll={filters.toggleAllBranches}
      emptyMessage="No branch options available."
    />
    <div className="flex flex-wrap gap-3">
      <div className="min-w-[12rem] flex-1 space-y-2 rounded-md border border-slate-200 p-3 sm:max-w-sm">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {TRADING_SUMMARY_REPORT_TEXT.scopeHeading}
        </div>
        <RadioList
          name="trading-summary-scope"
          value={filters.scope}
          options={scopeOptions}
          onChange={filters.setScope}
        />
      </div>
      <div className="min-w-[12rem] flex-1 space-y-2 rounded-md border border-slate-200 p-3 sm:max-w-sm">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {TRADING_SUMMARY_REPORT_TEXT.differenceHeading}
        </div>
        <RadioList
          name="trading-summary-diff-filter"
          value={filters.diffFilter}
          options={diffFilterOptions}
          onChange={filters.setDiffFilter}
        />
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        className="h-8 px-3 text-xs"
        onClick={filters.handleView}
        disabled={!filters.canView}
      >
        {TRADING_SUMMARY_REPORT_TEXT.view}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-8 px-3 text-xs"
        onClick={filters.resetFilters}
      >
        {TRADING_SUMMARY_REPORT_TEXT.reset}
      </Button>
    </div>
  </section>
);

export default TradingSummaryReportFiltersSection;
