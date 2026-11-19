export const BankReportScopeEnum = {
  BRANCH: 'branch',
  CONSOLIDATED: 'consolidated',
} as const;

export type BankReportScope =
  (typeof BankReportScopeEnum)[keyof typeof BankReportScopeEnum];

export const BankReportViewLayoutEnum = {
  LEDGER: 'LEDGER',
  COLUMNAR: 'COLUMNAR',
} as const;

export type BankReportViewLayout =
  (typeof BankReportViewLayoutEnum)[keyof typeof BankReportViewLayoutEnum];

export const BANK_REPORT_TEXT = {
  title: 'Bank Report',
  description:
    'Bank-book style ledger by bank accounts for selected branches and counters, with opening, receipts, payments, cheque details, closing, and CSV/XLSX export. Columnar view shows closing balances by account across branches.',
  branchHeading: 'Branch',
  accountHeading: 'Bank Account',
  counterHeading: 'Counter',
  scopeHeading: 'Scope',
  branchScope: 'Branch',
  consolidated: 'Consolidated',
  layoutHeading: 'View',
  layoutLedger: 'Ledger',
  layoutColumnar: 'Columnar',
  bankBookTitle: 'Bank Book Report',
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
  empty: 'No bank ledger data for the selected filters.',
  openingBalance: 'Opening Balance',
  closingBalance: 'Closing Balance',
  summaryOfBank: 'Summary of Bank',
  totalReceipts: 'Total Receipts',
  totalPayment: 'Total Payment',
} as const;
