import { useMemo } from 'react';
import { Button, Checkbox, DatePicker } from '@/components/ui';
import { formatDateInput, parseDateInput } from '@/utils';
import {
  OUTSTANDING_TRANSACTION_REPORT_TEXT,
  OutstandingGroupingEnum,
  OutstandingPartySelectionEnum,
  OutstandingReportLayoutEnum,
  OutstandingTransactionSideEnum,
} from '../constants/outstandingTransactionReportConstants';
import type { OutstandingTransactionReportFiltersState } from '../hooks/useOutstandingTransactionReportFilters';
import CheckboxFilterGroup from './CheckboxFilterGroup';
import ReportDatePresetFilter from './ReportDatePresetFilter';

interface OutstandingTransactionReportFiltersSectionProps {
  filters: OutstandingTransactionReportFiltersState;
}

const selectionOptions = [
  {
    id: OutstandingPartySelectionEnum.MSME,
    label: OUTSTANDING_TRANSACTION_REPORT_TEXT.msme,
  },
  {
    id: OutstandingPartySelectionEnum.OTHERS,
    label: OUTSTANDING_TRANSACTION_REPORT_TEXT.others,
  },
  {
    id: OutstandingPartySelectionEnum.ALL,
    label: OUTSTANDING_TRANSACTION_REPORT_TEXT.all,
  },
] as const;

const sideOptions = [
  {
    id: OutstandingTransactionSideEnum.PURCHASE,
    label: OUTSTANDING_TRANSACTION_REPORT_TEXT.purchase,
  },
  {
    id: OutstandingTransactionSideEnum.SALE,
    label: OUTSTANDING_TRANSACTION_REPORT_TEXT.sale,
  },
  {
    id: OutstandingTransactionSideEnum.BOTH,
    label: OUTSTANDING_TRANSACTION_REPORT_TEXT.both,
  },
] as const;

const groupingOptions = [
  {
    id: OutstandingGroupingEnum.CODE,
    label: OUTSTANDING_TRANSACTION_REPORT_TEXT.codeWise,
  },
  {
    id: OutstandingGroupingEnum.AGENT,
    label: OUTSTANDING_TRANSACTION_REPORT_TEXT.agentWise,
  },
] as const;

const layoutOptions = [
  {
    id: OutstandingReportLayoutEnum.DETAIL,
    label: OUTSTANDING_TRANSACTION_REPORT_TEXT.detail,
  },
  {
    id: OutstandingReportLayoutEnum.SUMMARY,
    label: OUTSTANDING_TRANSACTION_REPORT_TEXT.summary,
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

export const OutstandingTransactionReportFiltersSection = ({
  filters,
}: OutstandingTransactionReportFiltersSectionProps) => {
  const accountingDate = useMemo(
    () => parseDateInput(filters.accountingDate),
    [filters.accountingDate]
  );

  return (
    <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
      <ReportDatePresetFilter
        value={filters.dateRange}
        onChange={filters.setDateRange}
      />
      <div className="max-w-xs">
        <DatePicker
          label={OUTSTANDING_TRANSACTION_REPORT_TEXT.accountingDate}
          selected={accountingDate}
          onChange={date => {
            filters.setAccountingDate(date ? formatDateInput(date) : '');
          }}
          placeholder="Select accounting date"
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        <div className="space-y-2 rounded-md border border-slate-200 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            {OUTSTANDING_TRANSACTION_REPORT_TEXT.selectTypeHeading}
          </div>
          <RadioList
            name="outstanding-party-selection"
            value={filters.partySelection}
            options={selectionOptions}
            onChange={filters.setPartySelection}
          />
        </div>
        <div className="space-y-2 rounded-md border border-slate-200 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            {OUTSTANDING_TRANSACTION_REPORT_TEXT.transactionHeading}
          </div>
          <RadioList
            name="outstanding-transaction-side"
            value={filters.transactionSide}
            options={sideOptions}
            onChange={filters.setTransactionSide}
          />
        </div>
        <div className="space-y-2 rounded-md border border-slate-200 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            {OUTSTANDING_TRANSACTION_REPORT_TEXT.groupingHeading}
          </div>
          <RadioList
            name="outstanding-grouping"
            value={filters.grouping}
            options={groupingOptions}
            onChange={filters.setGrouping}
          />
        </div>
        <div className="space-y-2 rounded-md border border-slate-200 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            {OUTSTANDING_TRANSACTION_REPORT_TEXT.layoutHeading}
          </div>
          <RadioList
            name="outstanding-layout"
            value={filters.layout}
            options={layoutOptions}
            onChange={filters.setLayout}
          />
        </div>
      </div>

      <div className="max-w-md space-y-1">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {OUTSTANDING_TRANSACTION_REPORT_TEXT.entityTypeHeading}
        </label>
        <select
          className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-[12px] text-text-primary"
          value={filters.entityTypeId}
          onChange={event => filters.setEntityTypeId(event.target.value)}
        >
          <option value="">
            {OUTSTANDING_TRANSACTION_REPORT_TEXT.allEntityTypes}
          </option>
          {filters.entityTypeOptions.map(option => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <CheckboxFilterGroup
          heading={OUTSTANDING_TRANSACTION_REPORT_TEXT.branchHeading}
          options={filters.branchOptions}
          selectedIds={filters.branchIds}
          allSelected={filters.branchAllSelected}
          onToggle={filters.toggleBranch}
          onToggleAll={filters.toggleAllBranches}
          emptyMessage="No branch options available."
        />
        <CheckboxFilterGroup
          heading={OUTSTANDING_TRANSACTION_REPORT_TEXT.partyHeading}
          options={filters.partyOptions}
          selectedIds={filters.partyProfileIds}
          allSelected={filters.partyAllSelected}
          onToggle={filters.toggleParty}
          onToggleAll={filters.toggleAllParties}
          emptyMessage="No party options available."
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Checkbox
          id="outstanding-include-interest"
          checked={filters.includeInterest}
          onChange={filters.setIncludeInterest}
        >
          {OUTSTANDING_TRANSACTION_REPORT_TEXT.includeInterest}
        </Checkbox>
        <Checkbox
          id="outstanding-include-insurance"
          checked={filters.includeInsurance}
          onChange={filters.setIncludeInsurance}
        >
          {OUTSTANDING_TRANSACTION_REPORT_TEXT.includeInsurance}
        </Checkbox>
        <span className="text-[10px] text-text-tertiary">
          {OUTSTANDING_TRANSACTION_REPORT_TEXT.laterHint}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          className="h-8 px-3 text-xs"
          onClick={filters.handleView}
          disabled={!filters.canView}
        >
          {OUTSTANDING_TRANSACTION_REPORT_TEXT.view}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-8 px-3 text-xs"
          onClick={filters.resetFilters}
        >
          {OUTSTANDING_TRANSACTION_REPORT_TEXT.reset}
        </Button>
      </div>
    </section>
  );
};
