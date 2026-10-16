import { Button, Checkbox, Dropdown, Input } from '@/components/ui';
import { LRS_DAILY_REPORT_TEXT } from '../constants/lrsDailyReportConstants';
import type { LrsDailyReportFiltersState } from '../hooks/useLrsDailyReportFilters';
import { LrsDailyReportFormatEnum, type IReportSelectOption } from '../types';
import CheckboxFilterGroup from './CheckboxFilterGroup';
import ReportDatePresetFilter from './ReportDatePresetFilter';

interface LrsDailyReportFiltersSectionProps {
  filters: LrsDailyReportFiltersState;
}

const buildSelectionDescription = (count: number, total: number) => {
  if (total === 0) {
    return 'No options available';
  }

  return `${count} of ${total} selected`;
};

const FilterSelect = ({
  heading,
  value,
  emptyLabel,
  options,
  loading,
  allowEmpty = true,
  onChange,
}: {
  heading: string;
  value: string;
  emptyLabel: string;
  options: IReportSelectOption[];
  loading: boolean;
  allowEmpty?: boolean;
  onChange: (value: string) => void;
}) => {
  const currentLabel = loading
    ? LRS_DAILY_REPORT_TEXT.loading
    : (options.find(option => option.id === value)?.label ?? emptyLabel);

  return (
    <div className="space-y-1.5 rounded-md border border-slate-200 bg-white p-2 shadow-sm">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
        {heading}
      </div>
      <Dropdown>
        <Dropdown.Trigger
          className="h-8 w-full rounded-md border border-slate-200 bg-white px-3 text-left text-[11px] font-medium text-text-primary shadow-none"
          disabled={loading}
        >
          {currentLabel}
        </Dropdown.Trigger>
        <Dropdown.Menu className="min-w-full">
          {allowEmpty ? (
            <Dropdown.Item
              onClick={() => onChange('')}
              className="justify-between text-[11px]"
            >
              <span>{emptyLabel}</span>
            </Dropdown.Item>
          ) : null}
          {options.map(option => (
            <Dropdown.Item
              key={option.id}
              onClick={() => onChange(option.id)}
              className="justify-between text-[11px]"
            >
              <span>{option.label}</span>
              {value === option.id ? (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-600">
                  {LRS_DAILY_REPORT_TEXT.selectOption}
                </span>
              ) : null}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export const LrsDailyReportFiltersSection = ({
  filters,
}: LrsDailyReportFiltersSectionProps) => {
  return (
    <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
      <ReportDatePresetFilter
        value={filters.dateRange}
        onChange={nextValue => filters.setDateRange(nextValue)}
      />

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <CheckboxFilterGroup
          heading={LRS_DAILY_REPORT_TEXT.branchHeading}
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
        <div className="grid gap-3 sm:grid-cols-2">
          <FilterSelect
            heading={LRS_DAILY_REPORT_TEXT.productHeading}
            value={filters.productId}
            emptyLabel={LRS_DAILY_REPORT_TEXT.allProducts}
            options={filters.productOptions}
            loading={filters.isLoadingProducts}
            onChange={filters.setProductId}
          />
          <FilterSelect
            heading={LRS_DAILY_REPORT_TEXT.issuerHeading}
            value={filters.issuerPartyProfileId}
            emptyLabel={LRS_DAILY_REPORT_TEXT.allIssuers}
            options={filters.issuerOptions}
            loading={filters.isLoadingIssuers}
            onChange={filters.setIssuerPartyProfileId}
          />
          <FilterSelect
            heading={LRS_DAILY_REPORT_TEXT.purposeHeading}
            value={filters.purposeId}
            emptyLabel={LRS_DAILY_REPORT_TEXT.allPurposes}
            options={filters.purposeOptions}
            loading={filters.isLoadingPurposes}
            onChange={filters.setPurposeId}
          />
          <FilterSelect
            heading={LRS_DAILY_REPORT_TEXT.reportFormatHeading}
            value={filters.reportFormat}
            emptyLabel={LRS_DAILY_REPORT_TEXT.cimsFormat}
            options={[
              {
                id: LrsDailyReportFormatEnum.CIMS,
                label: LRS_DAILY_REPORT_TEXT.cimsFormat,
              },
              {
                id: LrsDailyReportFormatEnum.CIMS_UPLOAD,
                label: LRS_DAILY_REPORT_TEXT.cimsUploadFormat,
              },
            ]}
            loading={false}
            allowEmpty={false}
            onChange={value =>
              filters.setReportFormat(
                value === LrsDailyReportFormatEnum.CIMS_UPLOAD
                  ? LrsDailyReportFormatEnum.CIMS_UPLOAD
                  : LrsDailyReportFormatEnum.CIMS
              )
            }
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Input
          label={LRS_DAILY_REPORT_TEXT.usdRateLabel}
          type="number"
          min="0"
          step="any"
          value={filters.usdRate}
          placeholder={LRS_DAILY_REPORT_TEXT.usdRatePlaceholder}
          onChange={event => filters.setUsdRate(event.target.value)}
        />
        <Input
          label={LRS_DAILY_REPORT_TEXT.bankNameLabel}
          value={filters.bankName}
          valueTransform="none"
          placeholder={LRS_DAILY_REPORT_TEXT.bankNamePlaceholder}
          onChange={event => filters.setBankName(event.target.value)}
        />
        <Input
          label={LRS_DAILY_REPORT_TEXT.bankCodeLabel}
          value={filters.bankCode}
          placeholder={LRS_DAILY_REPORT_TEXT.bankCodePlaceholder}
          onChange={event => filters.setBankCode(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Checkbox
          id="lrs-show-tour-pax"
          checked={filters.showTourPaxBreakup}
          onChange={filters.setShowTourPaxBreakup}
        >
          {LRS_DAILY_REPORT_TEXT.showTourPax}
        </Checkbox>
        <Checkbox
          id="lrs-include-corporate"
          checked={filters.includeCorporateTransactions}
          onChange={filters.setIncludeCorporateTransactions}
        >
          {LRS_DAILY_REPORT_TEXT.includeCorporate}
        </Checkbox>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-2">
        <div className="text-[11px] text-text-secondary">
          {LRS_DAILY_REPORT_TEXT.requiredHint}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={filters.resetFilters}
            className="h-8 px-3 text-xs"
          >
            {LRS_DAILY_REPORT_TEXT.reset}
          </Button>
          <Button
            type="button"
            onClick={filters.handleView}
            className="h-8 px-3 text-xs"
            disabled={!filters.canView}
          >
            {LRS_DAILY_REPORT_TEXT.viewReport}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LrsDailyReportFiltersSection;
