import { Button } from '@/components/ui';
import { BankReportLayoutEnum, type BankReportLayout } from '../types';
import type { BankReconciliationReportFiltersState } from '../hooks/useBankReconciliationReportFilters';
import CheckboxFilterGroup from './CheckboxFilterGroup';
import ReportDatePresetFilter from './ReportDatePresetFilter';

interface BankReconciliationReportFiltersSectionProps {
  filters: BankReconciliationReportFiltersState;
}

const buildSelectionDescription = (count: number, total: number) => {
  if (total === 0) {
    return 'No options available';
  }

  return `${count} of ${total} selected`;
};

const scopeOptions = [
  { id: BankReportLayoutEnum.BRANCH_WISE, label: 'Branch' },
  { id: BankReportLayoutEnum.CONSOLIDATED, label: 'Consolidated' },
] as const;

const unclearedOptions = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
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

export const BankReconciliationReportFiltersSection = ({
  filters,
}: BankReconciliationReportFiltersSectionProps) => {
  return (
    <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
      <ReportDatePresetFilter
        value={filters.dateRange}
        onChange={nextValue => filters.setDateRange(nextValue)}
      />

      <div className="grid gap-3 xl:grid-cols-2">
        <CheckboxFilterGroup
          heading="Branch"
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

        <CheckboxFilterGroup
          heading="Bank Account"
          options={filters.accountOptions}
          selectedIds={filters.accountIds}
          allSelected={filters.accountAllSelected}
          onToggle={filters.toggleAccount}
          onToggleAll={filters.toggleAllAccounts}
          emptyMessage="No bank ledger accounts available."
          helperText={buildSelectionDescription(
            filters.accountIds.length,
            filters.accountOptions.length
          )}
          isLoading={filters.isAccountsLoading}
          hasMore={filters.hasMoreAccounts}
          isFetchingMore={filters.isAccountsFetchingMore}
          onLoadMore={filters.loadMoreAccounts}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="space-y-2 rounded-md border border-slate-200 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            Scope
          </div>
          <RadioList
            name="bank-reconciliation-scope"
            value={filters.layout}
            options={scopeOptions}
            onChange={(value: BankReportLayout) => filters.setLayout(value)}
          />
        </div>
        <div className="space-y-2 rounded-md border border-slate-200 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            Unreconciled Items
          </div>
          <RadioList
            name="bank-reconciliation-uncleared"
            value={filters.unclearedOnly ? 'yes' : 'no'}
            options={unclearedOptions}
            onChange={value => filters.setUnclearedOnly(value === 'yes')}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-2">
        <div className="text-[11px] text-text-secondary">
          Leave branch or account unselected to include all allowed options.
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={filters.resetFilters}
          >
            Reset
          </Button>
          <Button
            type="button"
            onClick={filters.handleView}
            disabled={!filters.canView}
          >
            View
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BankReconciliationReportFiltersSection;
