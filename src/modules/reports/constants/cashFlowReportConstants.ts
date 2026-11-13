export const CashFlowReportScopeEnum = {
  BRANCH: 'branch',
  CONSOLIDATED: 'consolidated',
} as const;

export type CashFlowReportScope =
  (typeof CashFlowReportScopeEnum)[keyof typeof CashFlowReportScopeEnum];

export const CASH_FLOW_REPORT_TEXT = {
  title: 'Cash Flow Report',
  description:
    'Opening balance, additions, inter-branch fund transfers, deductions, and closing cash/bank flow by selected ledger accounts.',
  branchHeading: 'Branch',
  accountHeading: 'Account',
  counterHeading: 'Counter',
  scopeHeading: 'Scope',
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
  empty: 'No cash flow data for the selected filters.',
  opening: 'Opening Balance',
  additions: '[+] Additions / Receipts',
  additionsTotal: 'Total Addition / Receipts',
  interBranch: 'Inter Branch Fund Transfer',
  interBranchTotal: 'Total Inter Branch',
  deductions: '[-] Deductions / Payments',
  deductionsTotal: 'Total Deductions / Payments',
  closing: 'Closing (Cash Flow)',
} as const;
