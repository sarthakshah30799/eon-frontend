import { useMemo } from 'react';
import { Button, Checkbox } from '@/components/ui';
import { useAuth } from '@/lib/AuthContext';
import {
  CheckboxFilterGroup,
  ReportDatePresetFilter,
  SalePurchaseReportTable,
  ScrollablePartyProfileFilter,
} from '../components';
import { useSalePurchaseReport } from '../hooks';
import {
  ReportExportFormatEnum,
  ReportTransactionTypeEnum,
} from '../types';

const buildSelectionDescription = (count: number, total: number) => {
  if (total === 0) {
    return 'No options available';
  }

  return `${count} of ${total} selected`;
};

const summarizeSelection = (values: string[], labels: Array<{ id: string; label: string }>) =>
  labels.filter(option => values.includes(option.id)).map(option => option.label);

export const ReportSalePurchaseView = () => {
  const { user } = useAuth();
  const report = useSalePurchaseReport();
  const canView = Boolean(user);

  const currentSummary = useMemo(() => {
    const stateLabels = summarizeSelection(report.filters.stateIds, report.filters.stateOptions);
    const branchLabels = summarizeSelection(report.filters.branchIds, report.filters.branchOptions);
    const counterLabels = summarizeSelection(report.filters.counterIds, report.filters.counterOptions);
    const typeLabels = summarizeSelection(
      report.filters.partyTypeCodes,
      report.filters.partyTypeOptions,
    );
    const txnTypeLabels = report.filters.transactionTypes.map(type =>
      type === ReportTransactionTypeEnum.PURCHASE ? 'Purchase' : 'Sale',
    );

    return {
      states: stateLabels,
      branches: branchLabels,
      counters: counterLabels,
      types: typeLabels,
      transactionTypes: txnTypeLabels,
    };
  }, [
    report.filters.branchIds,
    report.filters.branchOptions,
    report.filters.counterIds,
    report.filters.counterOptions,
    report.filters.partyTypeCodes,
    report.filters.partyTypeOptions,
    report.filters.stateIds,
    report.filters.stateOptions,
    report.filters.transactionTypes,
  ]);

  if (!canView) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-text-secondary">
        You do not have access to this page.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-text-primary">
          Sale & Purchase Reports
        </h1>
        <p className="max-w-3xl text-[11px] text-text-secondary">
          Grouped report for review, flat export for CSV/XLSX downloads.
        </p>
      </div>

      <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
        <ReportDatePresetFilter
          value={report.filters.dateRange}
          onChange={nextValue => report.filters.setDateRange(nextValue)}
        />

        <CheckboxFilterGroup
          heading="State"
          options={report.filters.stateOptions}
          selectedIds={report.filters.stateIds}
          allSelected={report.filters.stateAllSelected}
          onToggle={report.filters.toggleState}
          onToggleAll={report.filters.toggleAllStates}
          emptyMessage="No state options available."
          helperText={buildSelectionDescription(
            report.filters.stateIds.length,
            report.filters.stateOptions.length,
          )}
        />

        <div className="grid gap-3 xl:grid-cols-4">
          <CheckboxFilterGroup
            heading="Branch"
            options={report.filters.branchOptions}
            selectedIds={report.filters.branchIds}
            allSelected={report.filters.branchAllSelected}
            onToggle={report.filters.toggleBranch}
            onToggleAll={report.filters.toggleAllBranches}
            emptyMessage="No branch options available."
            helperText={buildSelectionDescription(
              report.filters.branchIds.length,
              report.filters.branchOptions.length,
            )}
          />

          <CheckboxFilterGroup
            heading="Counter"
            options={report.filters.counterOptions}
            selectedIds={report.filters.counterIds}
            allSelected={report.filters.counterAllSelected}
            onToggle={report.filters.toggleCounter}
            onToggleAll={report.filters.toggleAllCounters}
            emptyMessage="Select a branch first."
            helperText={buildSelectionDescription(
              report.filters.counterIds.length,
              report.filters.counterOptions.length,
            )}
            disabled={report.filters.branchIds.length === 0}
          />

          <CheckboxFilterGroup
            heading="Party Profile Types"
            options={report.filters.partyTypeOptions}
            selectedIds={report.filters.partyTypeCodes}
            allSelected={report.filters.partyTypeAllSelected}
            onToggle={report.filters.togglePartyType}
            onToggleAll={report.filters.toggleAllPartyTypes}
            emptyMessage="No party profile types found."
            helperText={buildSelectionDescription(
              report.filters.partyTypeCodes.length,
              report.filters.partyTypeOptions.length,
            )}
          />

          <ScrollablePartyProfileFilter
            profiles={report.filters.partyProfiles}
            isLoading={report.filters.isPartyProfilesLoading}
            isFetchingNextPage={report.filters.isPartyProfilesFetching}
            hasMore={report.filters.hasMorePartyProfiles}
            totalCount={report.filters.partyProfilesTotalItems}
            search={report.filters.partyProfileSearch}
            onSearch={report.filters.setPartyProfileSearch}
            selection={report.filters.partyProfileSelection}
            isSelected={report.filters.isPartyProfileSelected}
            onToggle={report.filters.togglePartyProfile}
            onToggleAll={report.filters.toggleSelectAllPartyProfiles}
            onLoadMore={() => {
              void report.filters.loadMorePartyProfiles();
            }}
            disabled={report.filters.partyTypeCodes.length === 0}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                Transaction Type
              </div>
            </div>
            <span className="text-[10px] text-text-tertiary">
              {buildSelectionDescription(report.filters.transactionTypes.length, 2)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-100 bg-slate-50 px-2 py-2">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-text-primary">
              <Checkbox
                checked={report.filters.transactionTypes.includes(
                  ReportTransactionTypeEnum.PURCHASE,
                )}
                onChange={checked =>
                  report.filters.toggleTransactionType(
                    ReportTransactionTypeEnum.PURCHASE,
                    checked,
                  )
                }
                id="transaction-type-purchase"
              />
              Purchase
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-text-primary">
              <Checkbox
                checked={report.filters.transactionTypes.includes(
                  ReportTransactionTypeEnum.SALE,
                )}
                onChange={checked =>
                  report.filters.toggleTransactionType(
                    ReportTransactionTypeEnum.SALE,
                    checked,
                  )
                }
                id="transaction-type-sale"
              />
              Sale
            </div>
            <button
              type="button"
              className="ml-auto text-[10px] font-medium text-primary-600 hover:text-primary-700"
              onClick={() =>
                report.filters.toggleAllTransactionTypes(
                  report.filters.transactionTypes.length !== 2,
                )
              }
            >
              {report.filters.transactionTypes.length === 2
                ? 'Clear all'
                : 'Select all'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-2">
          <div className="text-[11px] text-text-secondary">
            {report.filters.appliedFilters
              ? `Applied on ${report.filters.appliedDateRangeLabel}`
              : 'Press View Report to capture the current filter set.'}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={report.filters.resetFilters}
              className="h-8 px-3 text-xs"
            >
              Reset
            </Button>
            <Button
              type="button"
              onClick={report.filters.handleView}
              className="h-8 px-3 text-xs"
            >
              View Report
            </Button>
          </div>
        </div>
      </section>

      {report.filters.appliedFilters && (
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-text-secondary">
          Applied: {report.filters.appliedDateRangeLabel} | States{' '}
          {currentSummary.states.length ? currentSummary.states.join(', ') : 'All'} | Branches{' '}
          {currentSummary.branches.length ? currentSummary.branches.join(', ') : 'All'} | Counters{' '}
          {currentSummary.counters.length ? currentSummary.counters.join(', ') : 'All'} | Party Types{' '}
          {currentSummary.types.length ? currentSummary.types.join(', ') : 'All'} | Transaction{' '}
          {currentSummary.transactionTypes.length
            ? currentSummary.transactionTypes.join(', ')
            : 'All'} | Party Profiles{' '}
          {report.filters.partyProfileSelection.allSelected
            ? report.filters.partyProfileSelection.excludedIds.length > 0
              ? `All matching except ${report.filters.partyProfileSelection.excludedIds.length}`
              : 'All matching'
            : report.filters.partyProfileSelection.selectedIds.length > 0
              ? `${report.filters.partyProfileSelection.selectedIds.length} selected`
              : 'None selected'}
        </div>
      )}

      {report.filters.appliedFilters && (
        <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h2 className="text-sm font-semibold text-text-primary">Report View</h2>
              <p className="text-[11px] text-text-secondary">
                Grouped rows show transaction details on the first line, then item subtotal rows.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
                <Button
                  type="button"
                  size="sm"
                  variant={
                    report.exportFormat === ReportExportFormatEnum.XLSX
                      ? 'default'
                      : 'outline'
                  }
                  className="h-7 rounded-full px-3 text-[11px]"
                  onClick={() => report.setExportFormat(ReportExportFormatEnum.XLSX)}
                >
                  XLSX
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={
                    report.exportFormat === ReportExportFormatEnum.CSV
                      ? 'default'
                      : 'outline'
                  }
                  className="h-7 rounded-full px-3 text-[11px]"
                  onClick={() => report.setExportFormat(ReportExportFormatEnum.CSV)}
                >
                  CSV
                </Button>
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  void report.downloadGroupedReport();
                }}
                disabled={!report.isReady || report.isLoadingReport}
              >
                Download
              </Button>

              <Button
                type="button"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  void report.downloadFlatReport();
                }}
                disabled={!report.isReady || report.isLoadingReport}
              >
                Download Flat
              </Button>
            </div>
          </div>

          {report.reportError && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
              Failed to load report data. Please try again.
            </div>
          )}

          <SalePurchaseReportTable
            columns={report.reportColumns}
            rows={report.reportRows}
            loading={report.isLoadingReport || report.isFetchingReport}
          />
        </section>
      )}
    </div>
  );
};

export default ReportSalePurchaseView;
