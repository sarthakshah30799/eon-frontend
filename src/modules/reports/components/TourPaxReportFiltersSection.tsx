import { Button } from '@/components/ui';
import { TOUR_PAX_REPORT_TEXT } from '../constants/tourPaxReportConstants';
import type { TourPaxReportFiltersState } from '../hooks/useTourPaxReportFilters';
import CheckboxFilterGroup from './CheckboxFilterGroup';
import ReportDatePresetFilter from './ReportDatePresetFilter';

interface TourPaxReportFiltersSectionProps {
  filters: TourPaxReportFiltersState;
}

export const TourPaxReportFiltersSection = ({
  filters,
}: TourPaxReportFiltersSectionProps) => (
  <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
    <ReportDatePresetFilter
      value={filters.dateRange}
      onChange={filters.setDateRange}
    />
    <CheckboxFilterGroup
      heading={TOUR_PAX_REPORT_TEXT.branchHeading}
      options={filters.branchOptions}
      selectedIds={filters.branchIds}
      allSelected={filters.branchAllSelected}
      onToggle={filters.toggleBranch}
      onToggleAll={filters.toggleAllBranches}
      emptyMessage="No branch options available."
      helperText={
        filters.branchOptions.length
          ? `${filters.branchIds.length} of ${filters.branchOptions.length} selected`
          : 'No options available'
      }
    />
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        className="h-8 px-3 text-xs"
        onClick={filters.handleView}
        disabled={!filters.canView}
      >
        {TOUR_PAX_REPORT_TEXT.view}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-8 px-3 text-xs"
        onClick={filters.resetFilters}
      >
        {TOUR_PAX_REPORT_TEXT.reset}
      </Button>
    </div>
  </section>
);
