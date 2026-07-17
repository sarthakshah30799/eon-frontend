import type { ReactNode } from 'react';
import { Button, Checkbox } from '@/components/ui';
import type { SalePurchaseReportFilters } from '../hooks/useSalePurchaseReportFilters';
import { ReportTransactionTypeEnum } from '../types';
import CheckboxFilterGroup from './CheckboxFilterGroup';
import ReportDatePresetFilter from './ReportDatePresetFilter';
import ReportSortByFilter from './ReportSortByFilter';
import ScrollablePartyProfileFilter from './ScrollablePartyProfileFilter';

interface ReportCommonFiltersSectionProps {
  filters: SalePurchaseReportFilters;
  extraFilters?: ReactNode;
  showTransactionTypeFilter?: boolean;
}

const buildSelectionDescription = (count: number, total: number) => {
  if (total === 0) {
    return 'No options available';
  }

  return `${count} of ${total} selected`;
};

export const ReportCommonFiltersSection = ({
  filters,
  extraFilters,
  showTransactionTypeFilter = true,
}: ReportCommonFiltersSectionProps) => {
  return (
    <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
      <ReportDatePresetFilter
        value={filters.dateRange}
        onChange={nextValue => filters.setDateRange(nextValue)}
      />

      <ReportSortByFilter value={filters.sortBy} onChange={filters.setSortBy} />

      <CheckboxFilterGroup
        heading="State"
        options={filters.stateOptions}
        selectedIds={filters.stateIds}
        allSelected={filters.stateAllSelected}
        onToggle={filters.toggleState}
        onToggleAll={filters.toggleAllStates}
        emptyMessage="No state options available."
        helperText={buildSelectionDescription(
          filters.stateIds.length,
          filters.stateOptions.length,
        )}
      />

      <div className="grid gap-3 xl:grid-cols-4">
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
            filters.branchOptions.length,
          )}
        />

        <CheckboxFilterGroup
          heading="Counter"
          options={filters.counterOptions}
          selectedIds={filters.counterIds}
          allSelected={filters.counterAllSelected}
          onToggle={filters.toggleCounter}
          onToggleAll={filters.toggleAllCounters}
          emptyMessage="Select a branch first."
          helperText={buildSelectionDescription(
            filters.counterIds.length,
            filters.counterOptions.length,
          )}
          disabled={filters.branchIds.length === 0}
        />

        <CheckboxFilterGroup
          heading="Party Profile Types"
          options={filters.partyTypeOptions}
          selectedIds={filters.partyTypeCodes}
          allSelected={filters.partyTypeAllSelected}
          onToggle={filters.togglePartyType}
          onToggleAll={filters.toggleAllPartyTypes}
          emptyMessage="No party profile types found."
          helperText={buildSelectionDescription(
            filters.partyTypeCodes.length,
            filters.partyTypeOptions.length,
          )}
        />

        <ScrollablePartyProfileFilter
          profiles={filters.partyProfiles}
          isLoading={filters.isPartyProfilesLoading}
          isFetchingNextPage={filters.isPartyProfilesFetching}
          hasMore={filters.hasMorePartyProfiles}
          totalCount={filters.partyProfilesTotalItems}
          search={filters.partyProfileSearch}
          onSearch={filters.setPartyProfileSearch}
          selection={filters.partyProfileSelection}
          isSelected={filters.isPartyProfileSelected}
          onToggle={filters.togglePartyProfile}
          onToggleAll={filters.toggleSelectAllPartyProfiles}
          onLoadMore={() => {
            void filters.loadMorePartyProfiles();
          }}
          disabled={filters.partyTypeCodes.length === 0}
        />
      </div>

      {extraFilters}

      {showTransactionTypeFilter && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                Transaction Type
              </div>
            </div>
            <span className="text-[10px] text-text-tertiary">
              {buildSelectionDescription(filters.transactionTypes.length, 2)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-100 bg-slate-50 px-2 py-2">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-text-primary">
              <Checkbox
                checked={filters.transactionTypes.includes(ReportTransactionTypeEnum.PURCHASE)}
                onChange={checked =>
                  filters.toggleTransactionType(ReportTransactionTypeEnum.PURCHASE, checked)
                }
                id="transaction-type-purchase"
              />
              Purchase
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-text-primary">
              <Checkbox
                checked={filters.transactionTypes.includes(ReportTransactionTypeEnum.SALE)}
                onChange={checked =>
                  filters.toggleTransactionType(ReportTransactionTypeEnum.SALE, checked)
                }
                id="transaction-type-sale"
              />
              Sale
            </div>
            <button
              type="button"
              className="ml-auto text-[10px] font-medium text-primary-600 hover:text-primary-700"
              onClick={() =>
                filters.toggleAllTransactionTypes(filters.transactionTypes.length !== 2)
              }
            >
              {filters.transactionTypes.length === 2 ? 'Clear all' : 'Select all'}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-2">
        <div className="text-[11px] text-text-secondary">
          {filters.appliedFilters
            ? `Applied on ${filters.appliedDateRangeLabel}`
            : 'Press View Report to capture the current filter set.'}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={filters.resetFilters}
            className="h-8 px-3 text-xs"
          >
            Reset
          </Button>
          <Button
            type="button"
            onClick={filters.handleView}
            className="h-8 px-3 text-xs"
          >
            View Report
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ReportCommonFiltersSection;
