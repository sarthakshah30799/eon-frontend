export const SubLedgerReportLayoutEnum = {
  DETAIL: 'detail',
  SUMMARY: 'summary',
} as const;

export type SubLedgerReportLayout =
  (typeof SubLedgerReportLayoutEnum)[keyof typeof SubLedgerReportLayoutEnum];

export const SubLedgerReportScopeEnum = {
  BRANCH: 'branch',
  CONSOLIDATED: 'consolidated',
} as const;

export type SubLedgerReportScope =
  (typeof SubLedgerReportScopeEnum)[keyof typeof SubLedgerReportScopeEnum];

export const SubLedgerReportViewEnum = {
  LEDGER: 'ledger',
  COLUMNAR: 'columnar',
} as const;

export type SubLedgerReportView =
  (typeof SubLedgerReportViewEnum)[keyof typeof SubLedgerReportViewEnum];

export const SUB_LEDGER_ALL = '';

export const SUB_LEDGER_REPORT_TEXT = {
  title: 'Sub Ledger Report',
  description:
    'Ledger movements by sub ledger and account, with Detail/Summary, Branch/Consolidated, and columnar closing balances.',
  branchHeading: 'Branch',
  accountHeading: 'Account',
  typeHeading: 'Type',
  passengerHeading: 'Passenger Name',
  passengerPlaceholder: 'Search passenger name',
  layoutHeading: 'Report format',
  scopeHeading: 'Scope',
  detail: 'Detail',
  summary: 'Summary',
  branchScope: 'Branch',
  consolidated: 'Consolidated',
  allSubLedgers: 'All',
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
  empty: 'No ledger data for the selected filters.',
} as const;
