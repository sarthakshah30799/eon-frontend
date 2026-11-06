import { useMemo } from 'react';
import { Button, DatePicker } from '@/components/ui';
import { formatDateInput, parseDateInput } from '@/utils';
import {
  AFC_RECONCILIATION_REPORT_TEXT,
  AfcReconciliationReportLayoutEnum,
  AfcReconciliationReportScopeEnum,
} from '../constants/afcReconciliationReportConstants';
import type { AfcReconciliationReportFiltersState } from '../hooks/useAfcReconciliationReportFilters';
import CheckboxFilterGroup from './CheckboxFilterGroup';
import ReportDatePresetFilter from './ReportDatePresetFilter';

interface AfcReconciliationReportFiltersSectionProps {
  filters: AfcReconciliationReportFiltersState;
}

const layoutOptions = [
  {
    id: AfcReconciliationReportLayoutEnum.DETAIL,
    label: AFC_RECONCILIATION_REPORT_TEXT.detail,
  },
  {
    id: AfcReconciliationReportLayoutEnum.SUMMARY,
    label: AFC_RECONCILIATION_REPORT_TEXT.summary,
  },
] as const;

const scopeOptions = [
  {
    id: AfcReconciliationReportScopeEnum.BRANCH,
    label: AFC_RECONCILIATION_REPORT_TEXT.branchScope,
  },
  {
    id: AfcReconciliationReportScopeEnum.CONSOLIDATED,
    label: AFC_RECONCILIATION_REPORT_TEXT.consolidated,
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

export const AfcReconciliationReportFiltersSection = ({
  filters,
}: AfcReconciliationReportFiltersSectionProps) => {
  const accountingDate = useMemo(
    () => parseDateInput(filters.accountingDate),
    [filters.accountingDate]
  );

  return (
    <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
      <ReportDatePresetFilter
        value={filters.dateRange}
        onChange={filters.setDateRange}
      />
      <div className="max-w-xs">
        <DatePicker
          label={AFC_RECONCILIATION_REPORT_TEXT.accountingDate}
          selected={accountingDate}
          onChange={date => {
            filters.setAccountingDate(date ? formatDateInput(date) : '');
          }}
          placeholder="Select accounting date"
        />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <CheckboxFilterGroup
          heading={AFC_RECONCILIATION_REPORT_TEXT.branchHeading}
          options={filters.branchOptions}
          selectedIds={filters.branchIds}
          allSelected={filters.branchAllSelected}
          onToggle={filters.toggleBranch}
          onToggleAll={filters.toggleAllBranches}
          emptyMessage="No branch options available."
        />
        <CheckboxFilterGroup
          heading={AFC_RECONCILIATION_REPORT_TEXT.counterHeading}
          options={filters.counterOptions}
          selectedIds={filters.counterIds}
          allSelected={filters.counterAllSelected}
          onToggle={filters.toggleCounter}
          onToggleAll={filters.toggleAllCounters}
          emptyMessage="No counter options available."
        />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="space-y-2 rounded-md border border-slate-200 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            {AFC_RECONCILIATION_REPORT_TEXT.layoutHeading}
          </div>
          <RadioList
            name="afc-layout"
            value={filters.layout}
            options={layoutOptions}
            onChange={filters.setLayout}
          />
        </div>
        <div className="space-y-2 rounded-md border border-slate-200 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            {AFC_RECONCILIATION_REPORT_TEXT.scopeHeading}
          </div>
          <RadioList
            name="afc-scope"
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
          {AFC_RECONCILIATION_REPORT_TEXT.view}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-8 px-3 text-xs"
          onClick={filters.resetFilters}
        >
          {AFC_RECONCILIATION_REPORT_TEXT.reset}
        </Button>
      </div>
    </section>
  );
};
