export const OutstandingPartySelectionEnum = {
  MSME: 'msme',
  OTHERS: 'others',
  ALL: 'all',
} as const;

export type OutstandingPartySelection =
  (typeof OutstandingPartySelectionEnum)[keyof typeof OutstandingPartySelectionEnum];

export const OutstandingTransactionSideEnum = {
  PURCHASE: 'purchase',
  SALE: 'sale',
  BOTH: 'both',
} as const;

export type OutstandingTransactionSide =
  (typeof OutstandingTransactionSideEnum)[keyof typeof OutstandingTransactionSideEnum];

export const OutstandingGroupingEnum = {
  CODE: 'code',
  AGENT: 'agent',
} as const;

export type OutstandingGrouping =
  (typeof OutstandingGroupingEnum)[keyof typeof OutstandingGroupingEnum];

export const OutstandingReportLayoutEnum = {
  DETAIL: 'detail',
  SUMMARY: 'summary',
} as const;

export type OutstandingReportLayout =
  (typeof OutstandingReportLayoutEnum)[keyof typeof OutstandingReportLayoutEnum];

export const OUTSTANDING_TRANSACTION_REPORT_TEXT = {
  title: 'Outstanding Transaction Report',
  description:
    'Approved purchase and sale bills that are still unpaid as of the accounting date.',
  branchHeading: 'Branch',
  partyHeading: 'Party',
  entityTypeHeading: 'Entity type',
  selectTypeHeading: 'Select type',
  transactionHeading: 'Transactions',
  groupingHeading: 'Group by',
  layoutHeading: 'Report format',
  accountingDate: 'Accounting date',
  msme: 'MSME',
  others: 'Others',
  all: 'All',
  purchase: 'Purchase',
  sale: 'Sale',
  both: 'Both',
  codeWise: 'Code wise',
  agentWise: 'Agent wise',
  detail: 'Detail',
  summary: 'Summary',
  includeInterest: 'Include Interest',
  includeInsurance: 'Include Insurance',
  laterHint: 'Interest and insurance will be added later.',
  allEntityTypes: 'All entity types',
  view: 'View',
  reset: 'Reset',
  appliedPrefix: 'Showing',
  reportViewTitle: 'Report',
  xlsx: 'Excel',
  csv: 'CSV',
  download: 'Download',
  loadError: 'The report could not be loaded.',
  empty: 'No outstanding transactions.',
} as const;
