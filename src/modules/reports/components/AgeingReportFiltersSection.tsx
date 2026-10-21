import { Button } from '@/components/ui';
import {
  AGEING_REPORT_TEXT,
  AgeingEefcFilterEnum,
  AgeingPartySelectionEnum,
  AgeingReportLayoutEnum,
  AgeingScopeEnum,
  AgeingTransactionSideEnum,
} from '../constants/ageingReportConstants';
import type { AgeingReportFiltersState } from '../hooks/useAgeingReportFilters';
import CheckboxFilterGroup from './CheckboxFilterGroup';
import ReportDatePresetFilter from './ReportDatePresetFilter';

interface AgeingReportFiltersSectionProps {
  filters: AgeingReportFiltersState;
}

const selectionOptions = [
  { id: AgeingPartySelectionEnum.MSME, label: AGEING_REPORT_TEXT.msme },
  { id: AgeingPartySelectionEnum.OTHERS, label: AGEING_REPORT_TEXT.others },
  { id: AgeingPartySelectionEnum.ALL, label: AGEING_REPORT_TEXT.all },
] as const;

const sideOptions = [
  { id: AgeingTransactionSideEnum.PURCHASE, label: AGEING_REPORT_TEXT.purchase },
  { id: AgeingTransactionSideEnum.SALE, label: AGEING_REPORT_TEXT.sale },
  { id: AgeingTransactionSideEnum.BOTH, label: AGEING_REPORT_TEXT.both },
] as const;

const layoutOptions = [
  { id: AgeingReportLayoutEnum.DETAIL, label: AGEING_REPORT_TEXT.detail },
  { id: AgeingReportLayoutEnum.SUMMARY, label: AGEING_REPORT_TEXT.summary },
] as const;

const eefcOptions = [
  { id: AgeingEefcFilterEnum.EEFC, label: AGEING_REPORT_TEXT.eefc },
  { id: AgeingEefcFilterEnum.NON_EEFC, label: AGEING_REPORT_TEXT.nonEefc },
  { id: AgeingEefcFilterEnum.ALL, label: AGEING_REPORT_TEXT.all },
] as const;

const scopeOptions = [
  { id: AgeingScopeEnum.BRANCH, label: AGEING_REPORT_TEXT.branchScope },
  { id: AgeingScopeEnum.CONSOLIDATED, label: AGEING_REPORT_TEXT.consolidated },
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

export const AgeingReportFiltersSection = ({
  filters,
}: AgeingReportFiltersSectionProps) => (
  <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
    <ReportDatePresetFilter
      value={filters.dateRange}
      onChange={filters.setDateRange}
    />
    <div className="grid gap-3 lg:grid-cols-3">
      <div className="space-y-2 rounded-md border border-slate-200 p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {AGEING_REPORT_TEXT.selectTypeHeading}
        </div>
        <RadioList
          name="ageing-party-selection"
          value={filters.partySelection}
          options={selectionOptions}
          onChange={filters.setPartySelection}
        />
      </div>
      <div className="space-y-2 rounded-md border border-slate-200 p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {AGEING_REPORT_TEXT.transactionHeading}
        </div>
        <RadioList
          name="ageing-transaction-side"
          value={filters.transactionSide}
          options={sideOptions}
          onChange={filters.setTransactionSide}
        />
      </div>
      <div className="space-y-2 rounded-md border border-slate-200 p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {AGEING_REPORT_TEXT.layoutHeading}
        </div>
        <RadioList
          name="ageing-layout"
          value={filters.layout}
          options={layoutOptions}
          onChange={filters.setLayout}
        />
      </div>
      <div className="space-y-2 rounded-md border border-slate-200 p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {AGEING_REPORT_TEXT.eefcHeading}
        </div>
        <RadioList
          name="ageing-eefc"
          value={filters.eefcFilter}
          options={eefcOptions}
          onChange={filters.setEefcFilter}
        />
      </div>
      <div className="space-y-2 rounded-md border border-slate-200 p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {AGEING_REPORT_TEXT.scopeHeading}
        </div>
        <RadioList
          name="ageing-scope"
          value={filters.scope}
          options={scopeOptions}
          onChange={filters.setScope}
        />
      </div>
    </div>
    <div className="max-w-md space-y-1">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
        {AGEING_REPORT_TEXT.entityTypeHeading}
      </label>
      <select
        className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-[12px] text-text-primary"
        value={filters.entityTypeId}
        onChange={event => filters.setEntityTypeId(event.target.value)}
      >
        <option value="">{AGEING_REPORT_TEXT.allEntityTypes}</option>
        {filters.entityTypeOptions.map(option => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
    <div className="grid gap-3 lg:grid-cols-2">
      <CheckboxFilterGroup
        heading={AGEING_REPORT_TEXT.branchHeading}
        options={filters.branchOptions}
        selectedIds={filters.branchIds}
        allSelected={filters.branchAllSelected}
        onToggle={filters.toggleBranch}
        onToggleAll={filters.toggleAllBranches}
        emptyMessage="No branch options available."
      />
      <CheckboxFilterGroup
        heading={AGEING_REPORT_TEXT.partyHeading}
        options={filters.partyOptions}
        selectedIds={filters.partyProfileIds}
        allSelected={filters.partyAllSelected}
        onToggle={filters.toggleParty}
        onToggleAll={filters.toggleAllParties}
        emptyMessage="No party options available."
      />
      <CheckboxFilterGroup
        heading={AGEING_REPORT_TEXT.accountHeading}
        options={filters.accountOptions}
        selectedIds={filters.accountIds}
        allSelected={filters.accountAllSelected}
        onToggle={filters.toggleAccount}
        onToggleAll={filters.toggleAllAccounts}
        emptyMessage="No account options available."
      />
      <CheckboxFilterGroup
        heading={AGEING_REPORT_TEXT.ageingHeading}
        options={filters.ageingOptions}
        selectedIds={filters.ageingBuckets}
        allSelected={filters.ageingAllSelected}
        onToggle={filters.toggleAgeingBucket}
        onToggleAll={filters.toggleAllAgeingBuckets}
        emptyMessage="No ageing buckets available."
        helperText={AGEING_REPORT_TEXT.ageingHint}
      />
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        className="h-8 px-3 text-xs"
        onClick={filters.handleView}
        disabled={!filters.canView}
      >
        {AGEING_REPORT_TEXT.view}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-8 px-3 text-xs"
        onClick={filters.resetFilters}
      >
        {AGEING_REPORT_TEXT.reset}
      </Button>
    </div>
  </section>
);
