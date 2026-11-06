import { Button } from '@/components/ui';
import {
  FINAL_ACCOUNT_REPORT_TEXT,
  FinalAccountReportScopeEnum,
  FinalAccountStatementTypeEnum,
} from '../constants/finalAccountReportConstants';
import type { FinalAccountReportFiltersState } from '../hooks/useFinalAccountReportFilters';
import CheckboxFilterGroup from './CheckboxFilterGroup';
import ReportDatePresetFilter from './ReportDatePresetFilter';

interface FinalAccountReportFiltersSectionProps {
  filters: FinalAccountReportFiltersState;
}

const scopeOptions = [
  {
    id: FinalAccountReportScopeEnum.BRANCH,
    label: FINAL_ACCOUNT_REPORT_TEXT.branchScope,
  },
  {
    id: FinalAccountReportScopeEnum.CONSOLIDATED,
    label: FINAL_ACCOUNT_REPORT_TEXT.consolidated,
  },
] as const;

const statementOptions = [
  {
    id: FinalAccountStatementTypeEnum.TRADING,
    label: FINAL_ACCOUNT_REPORT_TEXT.trading,
  },
  {
    id: FinalAccountStatementTypeEnum.PROFIT_AND_LOSS,
    label: FINAL_ACCOUNT_REPORT_TEXT.profitAndLoss,
  },
  {
    id: FinalAccountStatementTypeEnum.BALANCE_SHEET,
    label: FINAL_ACCOUNT_REPORT_TEXT.balanceSheet,
  },
  {
    id: FinalAccountStatementTypeEnum.MERGE_PROFIT,
    label: FINAL_ACCOUNT_REPORT_TEXT.mergeProfit,
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

export const FinalAccountReportFiltersSection = ({
  filters,
}: FinalAccountReportFiltersSectionProps) => (
  <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
    <ReportDatePresetFilter
      value={filters.dateRange}
      onChange={filters.setDateRange}
    />
    <CheckboxFilterGroup
      heading={FINAL_ACCOUNT_REPORT_TEXT.branchHeading}
      options={filters.branchOptions}
      selectedIds={filters.branchIds}
      allSelected={filters.branchAllSelected}
      onToggle={filters.toggleBranch}
      onToggleAll={filters.toggleAllBranches}
      emptyMessage="No branch options available."
    />
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="space-y-2 rounded-md border border-slate-200 p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {FINAL_ACCOUNT_REPORT_TEXT.statementHeading}
        </div>
        <RadioList
          name="final-account-statement"
          value={filters.statementType}
          options={statementOptions}
          onChange={filters.setStatementType}
        />
      </div>
      <div className="space-y-2 rounded-md border border-slate-200 p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {FINAL_ACCOUNT_REPORT_TEXT.scopeHeading}
        </div>
        <RadioList
          name="final-account-scope"
          value={filters.scope}
          options={scopeOptions}
          onChange={filters.setScope}
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
        {FINAL_ACCOUNT_REPORT_TEXT.view}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-8 px-3 text-xs"
        onClick={filters.resetFilters}
      >
        {FINAL_ACCOUNT_REPORT_TEXT.reset}
      </Button>
    </div>
  </section>
);
