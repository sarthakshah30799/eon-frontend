import { Button } from '@/components/ui';
import { GenerateLedgerLayoutEnum } from '../types';
import type { GenerateLedgerFiltersState } from '../hooks/useGenerateLedgerFilters';
import CheckboxFilterGroup from './CheckboxFilterGroup';
import ReportDatePresetFilter from './ReportDatePresetFilter';

interface GenerateLedgerFiltersSectionProps {
  filters: GenerateLedgerFiltersState;
}

const buildSelectionDescription = (count: number, total: number) => {
  if (total === 0) {
    return 'No options available';
  }

  return `${count} of ${total} selected`;
};

export const GenerateLedgerFiltersSection = ({
  filters,
}: GenerateLedgerFiltersSectionProps) => {
  return (
    <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
      <ReportDatePresetFilter
        value={filters.dateRange}
        onChange={nextValue => filters.setDateRange(nextValue)}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={
            filters.layout === GenerateLedgerLayoutEnum.BRANCH_WISE
              ? 'default'
              : 'outline'
          }
          onClick={() =>
            filters.setLayout(GenerateLedgerLayoutEnum.BRANCH_WISE)
          }
        >
          Branch wise
        </Button>
        <Button
          type="button"
          size="sm"
          variant={
            filters.layout === GenerateLedgerLayoutEnum.CONSOLIDATED
              ? 'default'
              : 'outline'
          }
          onClick={() =>
            filters.setLayout(GenerateLedgerLayoutEnum.CONSOLIDATED)
          }
        >
          Consolidated
        </Button>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
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
          heading="Account Type"
          options={filters.accountTypeOptions}
          selectedIds={filters.accountTypeIds}
          allSelected={filters.accountTypeAllSelected}
          onToggle={filters.toggleAccountType}
          onToggleAll={filters.toggleAllAccountTypes}
          emptyMessage="No account type options available."
          helperText={buildSelectionDescription(
            filters.accountTypeIds.length,
            filters.accountTypeOptions.length
          )}
        />

        <CheckboxFilterGroup
          heading="Account"
          options={filters.accountOptions}
          selectedIds={filters.accountIds}
          allSelected={filters.accountAllSelected}
          onToggle={filters.toggleAccount}
          onToggleAll={filters.toggleAllAccounts}
          emptyMessage="No accounts available for the selected account types."
          helperText={buildSelectionDescription(
            filters.accountIds.length,
            filters.accountOptions.length
          )}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-2">
        <div className="text-[11px] text-text-secondary">
          Leave branch, account type, or account unselected to include all
          allowed options.
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

export default GenerateLedgerFiltersSection;
