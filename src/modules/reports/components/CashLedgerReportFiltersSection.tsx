import { Button } from '@/components/ui';
import {
  CASH_LEDGER_REPORT_TEXT,
  CashLedgerReportScopeEnum,
} from '../constants/cashLedgerReportConstants';
import type { CashLedgerReportFiltersState } from '../hooks/useCashLedgerReportFilters';
import { CashLedgerReportLayoutEnum } from '../types';
import CheckboxFilterGroup from './CheckboxFilterGroup';
import ReportDatePresetFilter from './ReportDatePresetFilter';

interface CashLedgerReportFiltersSectionProps {
  filters: CashLedgerReportFiltersState;
}

const scopeOptions = [
  {
    id: CashLedgerReportScopeEnum.BRANCH,
    label: CASH_LEDGER_REPORT_TEXT.branchScope,
  },
  {
    id: CashLedgerReportScopeEnum.CONSOLIDATED,
    label: CASH_LEDGER_REPORT_TEXT.consolidated,
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

export const CashLedgerReportFiltersSection = ({
  filters,
}: CashLedgerReportFiltersSectionProps) => {
  return (
    <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
      <ReportDatePresetFilter
        value={filters.dateRange}
        onChange={filters.setDateRange}
      />
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        <CheckboxFilterGroup
          heading={CASH_LEDGER_REPORT_TEXT.branchHeading}
          options={filters.branchOptions}
          selectedIds={filters.branchIds}
          allSelected={filters.branchAllSelected}
          onToggle={filters.toggleBranch}
          onToggleAll={filters.toggleAllBranches}
          emptyMessage="No branch options available."
        />
        <CheckboxFilterGroup
          heading={CASH_LEDGER_REPORT_TEXT.accountHeading}
          options={filters.accountOptions}
          selectedIds={filters.accountIds}
          allSelected={filters.accountAllSelected}
          onToggle={filters.toggleAccount}
          onToggleAll={filters.toggleAllAccounts}
          emptyMessage="No cash ledger accounts available."
          hasMore={filters.hasMoreAccounts}
          onLoadMore={filters.loadMoreAccounts}
          isLoading={filters.isAccountsLoading}
          isFetchingMore={filters.isAccountsFetchingMore}
        />
        <CheckboxFilterGroup
          heading={CASH_LEDGER_REPORT_TEXT.counterHeading}
          options={filters.counterOptions}
          selectedIds={filters.counterIds}
          allSelected={filters.counterAllSelected}
          onToggle={filters.toggleCounter}
          onToggleAll={filters.toggleAllCounters}
          emptyMessage="No counter options available."
        />
      </div>
      <div className="max-w-sm space-y-2 rounded-md border border-slate-200 p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {CASH_LEDGER_REPORT_TEXT.scopeHeading}
        </div>
        <RadioList
          name="cash-ledger-scope"
          value={filters.scope}
          options={scopeOptions}
          onChange={filters.setScope}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          className="h-8 px-3 text-xs"
          onClick={() =>
            filters.handleView(CashLedgerReportLayoutEnum.LEDGER)
          }
          disabled={!filters.canView}
        >
          {CASH_LEDGER_REPORT_TEXT.view}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-8 px-3 text-xs"
          onClick={() =>
            filters.handleView(CashLedgerReportLayoutEnum.COLUMNAR)
          }
          disabled={!filters.canView}
        >
          {CASH_LEDGER_REPORT_TEXT.viewColumnar}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-8 px-3 text-xs"
          onClick={filters.resetFilters}
        >
          {CASH_LEDGER_REPORT_TEXT.reset}
        </Button>
      </div>
    </section>
  );
};

export default CashLedgerReportFiltersSection;
