import { Button, Checkbox } from '@/components/ui';
import { TT_REPORT_TEXT } from '../constants/ttReportConstants';
import type { TtReportFiltersState } from '../hooks/useTtReportFilters';
import CheckboxFilterGroup from './CheckboxFilterGroup';
import ReportDatePresetFilter from './ReportDatePresetFilter';

interface TtReportFiltersSectionProps {
  filters: TtReportFiltersState;
}

const selectClassName =
  'h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-[12px] text-text-primary';

export const TtReportFiltersSection = ({
  filters,
}: TtReportFiltersSectionProps) => (
  <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
    <ReportDatePresetFilter
      value={filters.dateRange}
      onChange={filters.setDateRange}
    />
    <CheckboxFilterGroup
      heading={TT_REPORT_TEXT.branchHeading}
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
    <div className="max-w-md space-y-1">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {TT_REPORT_TEXT.productHeading}
        </label>
        <select
          className={selectClassName}
          value={filters.productId}
          onChange={event => filters.setProductId(event.target.value)}
        >
          {!filters.productOptions.length && (
            <option value="">{TT_REPORT_TEXT.allProducts}</option>
          )}
          {filters.productOptions.map(option => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
    </div>
    <CheckboxFilterGroup
        heading={TT_REPORT_TEXT.issuerHeading}
        options={filters.issuerOptions}
        selectedIds={filters.issuerPartyProfileIds}
        allSelected={filters.issuerAllSelected}
        onToggle={filters.toggleIssuer}
        onToggleAll={filters.toggleAllIssuers}
        emptyMessage="No issuer options available."
        helperText={
          filters.issuerOptions.length
            ? `${filters.issuerPartyProfileIds.length} of ${filters.issuerOptions.length} selected`
            : 'No options available'
        }
      />
    <div className="flex flex-wrap gap-4">
      <Checkbox
        id="tt-block-after"
        checked={filters.blockAfterGenerate}
        onChange={filters.setBlockAfterGenerate}
      >
        {TT_REPORT_TEXT.blockAfter}
      </Checkbox>
      <Checkbox
        id="tt-show-blocked"
        checked={filters.showBlocked}
        onChange={filters.setShowBlocked}
      >
        {TT_REPORT_TEXT.showBlocked}
      </Checkbox>
      <Checkbox
        id="tt-before-ho"
        checked={filters.showBeforeHoAcceptance}
        onChange={filters.setShowBeforeHoAcceptance}
      >
        {TT_REPORT_TEXT.showBeforeHo}
      </Checkbox>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        className="h-8 px-3 text-xs"
        onClick={filters.handleView}
        disabled={!filters.canView}
      >
        {TT_REPORT_TEXT.view}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-8 px-3 text-xs"
        onClick={filters.resetFilters}
      >
        {TT_REPORT_TEXT.reset}
      </Button>
    </div>
  </section>
);
