import { Button, Input } from '@/components/ui';
import {
  SUB_LEDGER_REPORT_TEXT,
  SubLedgerReportLayoutEnum,
  SubLedgerReportScopeEnum,
  SubLedgerReportViewEnum,
} from '../constants/subLedgerReportConstants';
import type { SubLedgerReportFiltersState } from '../hooks/useSubLedgerReportFilters';
import CheckboxFilterGroup from './CheckboxFilterGroup';
import ReportDatePresetFilter from './ReportDatePresetFilter';

interface SubLedgerReportFiltersSectionProps {
  filters: SubLedgerReportFiltersState;
}

const layoutOptions = [
  {
    id: SubLedgerReportLayoutEnum.DETAIL,
    label: SUB_LEDGER_REPORT_TEXT.detail,
  },
  {
    id: SubLedgerReportLayoutEnum.SUMMARY,
    label: SUB_LEDGER_REPORT_TEXT.summary,
  },
] as const;

const scopeOptions = [
  {
    id: SubLedgerReportScopeEnum.BRANCH,
    label: SUB_LEDGER_REPORT_TEXT.branchScope,
  },
  {
    id: SubLedgerReportScopeEnum.CONSOLIDATED,
    label: SUB_LEDGER_REPORT_TEXT.consolidated,
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

export const SubLedgerReportFiltersSection = ({
  filters,
}: SubLedgerReportFiltersSectionProps) => (
  <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
    <ReportDatePresetFilter
      value={filters.dateRange}
      onChange={filters.setDateRange}
    />
    <div className="grid gap-3 lg:grid-cols-2">
      <CheckboxFilterGroup
        heading={SUB_LEDGER_REPORT_TEXT.branchHeading}
        options={filters.branchOptions}
        selectedIds={filters.branchIds}
        allSelected={filters.branchAllSelected}
        onToggle={filters.toggleBranch}
        onToggleAll={filters.toggleAllBranches}
        emptyMessage="No branch options available."
      />
      <div className="space-y-2 rounded-md border border-slate-200 p-3">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {SUB_LEDGER_REPORT_TEXT.accountHeading}
        </label>
        <select
          className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-[12px] text-text-primary"
          value={filters.subLedgerId}
          onChange={event => filters.setSubLedgerId(event.target.value)}
        >
          <option value="">{SUB_LEDGER_REPORT_TEXT.allSubLedgers}</option>
          {filters.subLedgerOptions.map(option => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
    <CheckboxFilterGroup
      heading={SUB_LEDGER_REPORT_TEXT.typeHeading}
      options={filters.accountOptions}
      selectedIds={filters.accountIds}
      allSelected={filters.accountAllSelected}
      onToggle={filters.toggleAccount}
      onToggleAll={filters.toggleAllAccounts}
      emptyMessage="No accounts available for the selected sub ledger."
      isLoading={filters.isAccountsLoading}
      hasMore={filters.hasMoreAccounts}
      isFetchingMore={filters.isAccountsFetchingMore}
      onLoadMore={filters.loadMoreAccounts}
    />
    <div className="space-y-2 rounded-md border border-slate-200 p-3">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
        {SUB_LEDGER_REPORT_TEXT.passengerHeading}
      </label>
      <Input
        label={SUB_LEDGER_REPORT_TEXT.passengerHeading}
        placeholder={SUB_LEDGER_REPORT_TEXT.passengerPlaceholder}
        value={filters.passengerName}
        onChange={event => filters.setPassengerName(event.target.value)}
        valueTransform="none"
        classes={{ container: 'max-w-none', label: 'sr-only' }}
      />
    </div>
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="space-y-2 rounded-md border border-slate-200 p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {SUB_LEDGER_REPORT_TEXT.layoutHeading}
        </div>
        <RadioList
          name="sub-ledger-layout"
          value={filters.layout}
          options={layoutOptions}
          onChange={filters.setLayout}
        />
      </div>
      <div className="space-y-2 rounded-md border border-slate-200 p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {SUB_LEDGER_REPORT_TEXT.scopeHeading}
        </div>
        <RadioList
          name="sub-ledger-scope"
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
        onClick={() => filters.handleView(SubLedgerReportViewEnum.LEDGER)}
        disabled={!filters.canView}
      >
        {SUB_LEDGER_REPORT_TEXT.view}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-8 px-3 text-xs"
        onClick={() => filters.handleView(SubLedgerReportViewEnum.COLUMNAR)}
        disabled={!filters.canView}
      >
        {SUB_LEDGER_REPORT_TEXT.viewColumnar}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-8 px-3 text-xs"
        onClick={filters.resetFilters}
      >
        {SUB_LEDGER_REPORT_TEXT.reset}
      </Button>
    </div>
  </section>
);
