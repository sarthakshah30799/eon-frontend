export const TradingSummaryReportScopeEnum = {
  BRANCH: 'branch',
  CONSOLIDATED: 'consolidated',
} as const;

export type TradingSummaryReportScope =
  (typeof TradingSummaryReportScopeEnum)[keyof typeof TradingSummaryReportScopeEnum];

export const TradingSummaryDiffFilterEnum = {
  HAS_DIFF: 'has_diff',
  NO_DIFF: 'no_diff',
} as const;

export type TradingSummaryDiffFilter =
  (typeof TradingSummaryDiffFilterEnum)[keyof typeof TradingSummaryDiffFilterEnum];

export const TRADING_SUMMARY_REPORT_TEXT = {
  title: 'Trading Summary Report',
  description:
    'Product-level stock valuation in INR with opening, purchase, sales (cost of sales), AWP-based closing, and difference. Diff = opening + purchase − sales − closing.',
  branchHeading: 'Branch',
  scopeHeading: 'Scope',
  branchScope: 'Branch',
  consolidated: 'Consolidated',
  differenceHeading: 'Stock Difference',
  hasDiff: 'Has Diff',
  noDiff: 'No Diff',
  view: 'View',
  reset: 'Reset',
  appliedPrefix: 'Showing',
  all: 'All',
  reportViewTitle: 'Report',
  xlsx: 'Excel',
  csv: 'CSV',
  download: 'Download',
  loadError: 'The report could not be loaded.',
  empty: 'No trading summary data for the selected filters.',
  product: 'product',
  opening: 'opening',
  purchase: 'purchase',
  sales: 'sales',
  closing: 'closing',
  diff: 'diff',
} as const;
