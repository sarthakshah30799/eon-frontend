export const TrialBalanceReportScopeEnum = {
  BRANCH: 'branch',
  CONSOLIDATED: 'consolidated',
} as const;

export type TrialBalanceReportScope =
  (typeof TrialBalanceReportScopeEnum)[keyof typeof TrialBalanceReportScopeEnum];

export const TRIAL_BALANCE_REPORT_TEXT = {
  title: 'Trial Balance Report',
  description:
    'Opening, period, and closing debit/credit balances by account, with optional grouping by financial type and financial code.',
  branchHeading: 'Branch',
  scopeHeading: 'Scope',
  groupByHeading: 'Group by',
  groupByLabel: 'Group by financial type and code',
  mergeProfitHeading: 'Merge Profit',
  mergeProfit: 'Merge Profit',
  branchScope: 'Branch',
  consolidated: 'Consolidated',
  view: 'View',
  reset: 'Reset',
  appliedPrefix: 'Showing',
  all: 'All',
  yes: 'Yes',
  no: 'No',
  reportViewTitle: 'Report',
  xlsx: 'Excel',
  csv: 'CSV',
  download: 'Download',
  loadError: 'The report could not be loaded.',
  empty: 'No trial balance data for the selected filters.',
} as const;
