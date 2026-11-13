export const FinalAccountReportScopeEnum = {
  BRANCH: 'branch',
  CONSOLIDATED: 'consolidated',
} as const;

export type FinalAccountReportScope =
  (typeof FinalAccountReportScopeEnum)[keyof typeof FinalAccountReportScopeEnum];

export const FinalAccountStatementTypeEnum = {
  TRADING: 'trading',
  PROFIT_AND_LOSS: 'profit-and-loss',
  BALANCE_SHEET: 'balance-sheet',
} as const;

export type FinalAccountStatementType =
  (typeof FinalAccountStatementTypeEnum)[keyof typeof FinalAccountStatementTypeEnum];

export const FINAL_ACCOUNT_REPORT_TEXT = {
  title: 'Final Account Report',
  description:
    'Trading, Profit & Loss, and Balance Sheet statements by branch or consolidated.',
  branchHeading: 'Branch',
  scopeHeading: 'Scope',
  statementHeading: 'Statement',
  mergeProfitHeading: 'Merge Profit',
  branchScope: 'Branch',
  consolidated: 'Consolidated',
  trading: 'Trading',
  profitAndLoss: 'Profit And Loss',
  balanceSheet: 'Balance Sheet',
  mergeProfit: 'Merge Profit',
  mergeProfitYes: 'Yes',
  mergeProfitNo: 'No',
  view: 'View',
  reset: 'Reset',
  appliedPrefix: 'Showing',
  all: 'All',
  reportViewTitle: 'Report',
  total: 'Total',
  xlsx: 'Excel',
  csv: 'CSV',
  download: 'Download',
  loadError: 'The report could not be loaded.',
  empty: 'No final account data for the selected filters.',
} as const;
