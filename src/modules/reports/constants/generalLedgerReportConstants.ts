export const GeneralLedgerReportLayoutEnum = {
  DETAIL: 'detail',
  SUMMARY: 'summary',
} as const;

export type GeneralLedgerReportLayout =
  (typeof GeneralLedgerReportLayoutEnum)[keyof typeof GeneralLedgerReportLayoutEnum];

export const GeneralLedgerReportScopeEnum = {
  BRANCH: 'branch',
  CONSOLIDATED: 'consolidated',
} as const;

export type GeneralLedgerReportScope =
  (typeof GeneralLedgerReportScopeEnum)[keyof typeof GeneralLedgerReportScopeEnum];

export const GeneralLedgerReportViewEnum = {
  LEDGER: 'ledger',
  COLUMNAR: 'columnar',
} as const;

export type GeneralLedgerReportView =
  (typeof GeneralLedgerReportViewEnum)[keyof typeof GeneralLedgerReportViewEnum];

export const GENERAL_LEDGER_ALL_FINANCIAL_TYPE = '';

export const GENERAL_LEDGER_REPORT_TEXT = {
  title: 'General Ledger Report',
  description:
    'Ledger movements by account with Detail/Summary and Branch/Consolidated views, plus columnar closing balances.',
  branchHeading: 'Branch',
  accountHeading: 'Account',
  typeHeading: 'Type',
  layoutHeading: 'Report format',
  scopeHeading: 'Scope',
  detail: 'Detail',
  summary: 'Summary',
  branchScope: 'Branch',
  consolidated: 'Consolidated',
  allFinancialTypes: 'All',
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
