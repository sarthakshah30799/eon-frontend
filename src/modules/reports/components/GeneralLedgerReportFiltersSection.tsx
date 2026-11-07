import { Button } from '@/components/ui';
import {
  GENERAL_LEDGER_REPORT_TEXT,
  GeneralLedgerReportLayoutEnum,
  GeneralLedgerReportScopeEnum,
  GeneralLedgerReportViewEnum,
} from '../constants/generalLedgerReportConstants';
import type { GeneralLedgerReportFiltersState } from '../hooks/useGeneralLedgerReportFilters';
import CheckboxFilterGroup from './CheckboxFilterGroup';
import ReportDatePresetFilter from './ReportDatePresetFilter';

interface GeneralLedgerReportFiltersSectionProps {
  filters: GeneralLedgerReportFiltersState;
}

const layoutOptions = [
  {
    id: GeneralLedgerReportLayoutEnum.DETAIL,
    label: GENERAL_LEDGER_REPORT_TEXT.detail,
  },
  {
    id: GeneralLedgerReportLayoutEnum.SUMMARY,
    label: GENERAL_LEDGER_REPORT_TEXT.summary,
  },
] as const;

const scopeOptions = [
  {
    id: GeneralLedgerReportScopeEnum.BRANCH,
    label: GENERAL_LEDGER_REPORT_TEXT.branchScope,
  },
  {
    id: GeneralLedgerReportScopeEnum.CONSOLIDATED,
    label: GENERAL_LEDGER_REPORT_TEXT.consolidated,
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

export const GeneralLedgerReportFiltersSection = ({
  filters,
}: GeneralLedgerReportFiltersSectionProps) => (
  <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
    <ReportDatePresetFilter
      value={filters.dateRange}
      onChange={filters.setDateRange}
    />
    <div className="grid gap-3 lg:grid-cols-2">
      <CheckboxFilterGroup
        heading={GENERAL_LEDGER_REPORT_TEXT.branchHeading}
        options={filters.branchOptions}
        selectedIds={filters.branchIds}
        allSelected={filters.branchAllSelected}
        onToggle={filters.toggleBranch}
        onToggleAll={filters.toggleAllBranches}
        emptyMessage="No branch options available."
      />
      <div className="space-y-2 rounded-md border border-slate-200 p-3">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {GENERAL_LEDGER_REPORT_TEXT.accountHeading}
        </label>
        <select
          className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-[12px] text-text-primary"
          value={filters.financialTypeId}
          onChange={event => filters.setFinancialTypeId(event.target.value)}
        >
          <option value="">
            {GENERAL_LEDGER_REPORT_TEXT.allFinancialTypes}
          </option>
          {filters.financialTypeOptions.map(option => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
    <CheckboxFilterGroup
      heading={GENERAL_LEDGER_REPORT_TEXT.typeHeading}
      options={filters.accountOptions}
      selectedIds={filters.accountIds}
      allSelected={filters.accountAllSelected}
      onToggle={filters.toggleAccount}
      onToggleAll={filters.toggleAllAccounts}
      emptyMessage="No accounts available for the selected financial type."
      isLoading={filters.isAccountsLoading}
      hasMore={filters.hasMoreAccounts}
      isFetchingMore={filters.isAccountsFetchingMore}
      onLoadMore={filters.loadMoreAccounts}
    />
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="space-y-2 rounded-md border border-slate-200 p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {GENERAL_LEDGER_REPORT_TEXT.layoutHeading}
        </div>
        <RadioList
          name="general-ledger-layout"
          value={filters.layout}
          options={layoutOptions}
          onChange={filters.setLayout}
        />
      </div>
      <div className="space-y-2 rounded-md border border-slate-200 p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {GENERAL_LEDGER_REPORT_TEXT.scopeHeading}
        </div>
        <RadioList
          name="general-ledger-scope"
          value={filters.scope}
          options={scopeOptions}
          onChange={filters.setScope}
        />
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        className="h-8 px-3 text-xs"
        onClick={() => filters.handleView(GeneralLedgerReportViewEnum.LEDGER)}
        disabled={!filters.canView}
      >
        {GENERAL_LEDGER_REPORT_TEXT.view}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-8 px-3 text-xs"
        onClick={() =>
          filters.handleView(GeneralLedgerReportViewEnum.COLUMNAR)
        }
        disabled={!filters.canView}
      >
        {GENERAL_LEDGER_REPORT_TEXT.viewColumnar}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-8 px-3 text-xs"
        onClick={filters.resetFilters}
      >
        {GENERAL_LEDGER_REPORT_TEXT.reset}
      </Button>
    </div>
  </section>
);
