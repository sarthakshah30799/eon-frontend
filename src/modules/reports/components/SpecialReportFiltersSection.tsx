import { Button, Dropdown, Input } from '@/components/ui';
import CheckboxFilterGroup from './CheckboxFilterGroup';
import ReportSortByFilter from './ReportSortByFilter';
import type { SpecialReportFilters } from '../hooks/useSpecialReportFilters';

interface SpecialReportFiltersSectionProps {
  filters: SpecialReportFilters;
}

export const SpecialReportFiltersSection = ({
  filters,
}: SpecialReportFiltersSectionProps) => {
  const currentTemplateLabel =
    filters.templateOptions.find(option => option.id === filters.template)?.label ??
    'Account Posting';

  return (
    <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_260px]">
        <CheckboxFilterGroup
          heading="Branch"
          options={filters.branchOptions}
          selectedIds={filters.branchIds}
          allSelected={filters.branchAllSelected}
          onToggle={filters.toggleBranch}
          onToggleAll={filters.toggleAllBranches}
          emptyMessage="No branch options available."
          helperText={
            filters.branchOptions.length > 0
              ? `${filters.branchIds.length} of ${filters.branchOptions.length} selected`
              : 'No branch options available.'
          }
        />

        <div className="space-y-1.5 rounded-md border border-slate-200 bg-white p-2 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
              Special Report Type
            </div>
            <span className="text-[10px] text-text-tertiary">1 option</span>
          </div>

          <div className="rounded-md border border-slate-100 bg-slate-50 px-2 py-1.5">
            <Dropdown>
              <Dropdown.Trigger className="h-8 w-full rounded-md border border-slate-200 bg-white px-3 text-left text-[11px] font-medium text-text-primary shadow-none">
                {currentTemplateLabel}
              </Dropdown.Trigger>
              <Dropdown.Menu className="min-w-full">
                {filters.templateOptions.map(option => (
                  <Dropdown.Item
                    key={option.id}
                    onClick={() => {
                      filters.setTemplate(option.id);
                    }}
                    className="justify-between text-[11px]"
                  >
                    <span>{option.label}</span>
                    {filters.template === option.id ? (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-600">
                        Selected
                      </span>
                    ) : null}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_260px]">
        <Input
          label="Transaction Numbers"
          placeholder="Comma-separated numbers"
          value={filters.transactionNumbersText}
          onChange={event => filters.setTransactionNumbersText(event.target.value)}
        />
        <ReportSortByFilter value={filters.sortBy} onChange={filters.setSortBy} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-2">
        <div className="text-[11px] text-text-secondary">
          Select at least one branch before viewing the report.
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
            disabled={!filters.canView}
          >
            View Report
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SpecialReportFiltersSection;
