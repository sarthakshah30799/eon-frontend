import { Button, Checkbox } from '@/components/ui';
import {
  TRIAL_BALANCE_REPORT_TEXT,
  TrialBalanceReportScopeEnum,
} from '../constants/trialBalanceReportConstants';
import type { TrialBalanceReportFiltersState } from '../hooks/useTrialBalanceReportFilters';
import CheckboxFilterGroup from './CheckboxFilterGroup';
import ReportDatePresetFilter from './ReportDatePresetFilter';

interface TrialBalanceReportFiltersSectionProps {
  filters: TrialBalanceReportFiltersState;
}

const scopeOptions = [
  {
    id: TrialBalanceReportScopeEnum.BRANCH,
    label: TRIAL_BALANCE_REPORT_TEXT.branchScope,
  },
  {
    id: TrialBalanceReportScopeEnum.CONSOLIDATED,
    label: TRIAL_BALANCE_REPORT_TEXT.consolidated,
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

export const TrialBalanceReportFiltersSection = ({
  filters,
}: TrialBalanceReportFiltersSectionProps) => (
  <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
    <ReportDatePresetFilter
      value={filters.dateRange}
      onChange={filters.setDateRange}
    />
    <CheckboxFilterGroup
      heading={TRIAL_BALANCE_REPORT_TEXT.branchHeading}
      options={filters.branchOptions}
      selectedIds={filters.branchIds}
      allSelected={filters.branchAllSelected}
      onToggle={filters.toggleBranch}
      onToggleAll={filters.toggleAllBranches}
      emptyMessage="No branch options available."
    />
    <div className="grid gap-3 lg:grid-cols-3">
      <div className="space-y-2 rounded-md border border-slate-200 p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {TRIAL_BALANCE_REPORT_TEXT.scopeHeading}
        </div>
        <RadioList
          name="trial-balance-scope"
          value={filters.scope}
          options={scopeOptions}
          onChange={filters.setScope}
        />
      </div>
      <div className="space-y-2 rounded-md border border-slate-200 p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {TRIAL_BALANCE_REPORT_TEXT.groupByHeading}
        </div>
        <Checkbox
          id="trial-balance-group-by"
          checked={filters.groupBy}
          onChange={checked => filters.setGroupBy(Boolean(checked))}
        >
          {TRIAL_BALANCE_REPORT_TEXT.groupByLabel}
        </Checkbox>
      </div>
      <div className="space-y-2 rounded-md border border-slate-200 p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {TRIAL_BALANCE_REPORT_TEXT.mergeProfitHeading}
        </div>
        <Checkbox
          id="trial-balance-merge-profit"
          checked={filters.mergeProfit}
          onChange={checked => filters.setMergeProfit(Boolean(checked))}
        >
          {TRIAL_BALANCE_REPORT_TEXT.mergeProfit}
        </Checkbox>
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        className="h-8 px-3 text-xs"
        onClick={filters.handleView}
        disabled={!filters.canView}
      >
        {TRIAL_BALANCE_REPORT_TEXT.view}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-8 px-3 text-xs"
        onClick={filters.resetFilters}
      >
        {TRIAL_BALANCE_REPORT_TEXT.reset}
      </Button>
    </div>
  </section>
);
