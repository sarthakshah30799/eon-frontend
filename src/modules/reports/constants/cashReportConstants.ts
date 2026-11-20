export const CashReportScopeEnum = {
  BRANCH: 'branch',
  CONSOLIDATED: 'consolidated',
} as const;

export type CashReportScope =
  (typeof CashReportScopeEnum)[keyof typeof CashReportScopeEnum];

export const CASH_REPORT_TEXT = {
  title: 'Cash Report',
  description:
    'Cash-book style ledger by cash accounts linked to selected branches, with opening, receipts, payments, closing, and a per-branch Summary of Cash. Columnar view shows closing balances by account code across branches.',
  branchHeading: 'Branch',
  accountHeading: 'Account',
  counterHeading: 'Counter',
  scopeHeading: 'Scope',
  branchScope: 'Branch',
  consolidated: 'Consolidated',
  layoutHeading: 'View',
  layoutLedger: 'Ledger',
  layoutColumnar: 'Columnar',
  cashBookTitle: 'Cash Book Report',
  forPeriod: 'For Period',
  view: 'View',
  viewColumnar: 'View Columnar',
  reset: 'Reset',
  appliedPrefix: 'Showing',
  all: 'All',
  reportViewTitle: 'Report',
  xlsx: 'Excel',
  csv: 'CSV',
  download: 'Download',
  loadError: 'The report could not be loaded.',
  empty: 'No cash ledger data for the selected filters.',
  openingBalance: 'Opening Balance',
  closingBalance: 'Closing Balance',
  summaryOfCash: 'Summary of Cash',
  totalReceipts: 'Total Receipts',
  totalPayment: 'Total Payment',
} as const;
