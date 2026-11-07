export const AfcReconciliationReportLayoutEnum = {
  DETAIL: 'detail',
  SUMMARY: 'summary',
} as const;

export type AfcReconciliationReportLayout =
  (typeof AfcReconciliationReportLayoutEnum)[keyof typeof AfcReconciliationReportLayoutEnum];

export const AfcReconciliationReportScopeEnum = {
  BRANCH: 'branch',
  CONSOLIDATED: 'consolidated',
} as const;

export type AfcReconciliationReportScope =
  (typeof AfcReconciliationReportScopeEnum)[keyof typeof AfcReconciliationReportScopeEnum];

export const AFC_RECONCILIATION_REPORT_TEXT = {
  title: 'AFC Reconciliation Report',
  description:
    'Outstanding Advance From Customer (AFC) receipts from approved CRF requests, as of the accounting date.',
  branchHeading: 'Branch',
  counterHeading: 'Counter',
  layoutHeading: 'Report format',
  scopeHeading: 'Scope',
  accountingDate: 'Accounting date',
  detail: 'Detail',
  summary: 'Summary',
  branchScope: 'Branch',
  consolidated: 'Consolidated',
  view: 'View',
  reset: 'Reset',
  appliedPrefix: 'Showing',
  all: 'All',
  reportViewTitle: 'Report',
  xlsx: 'Excel',
  csv: 'CSV',
  download: 'Download',
  loadError: 'The report could not be loaded.',
  empty: 'No outstanding AFC advances for the selected filters.',
} as const;
