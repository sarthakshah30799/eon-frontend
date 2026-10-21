export const AgeingPartySelectionEnum = {
  MSME: 'msme',
  OTHERS: 'others',
  ALL: 'all',
} as const;

export type AgeingPartySelection =
  (typeof AgeingPartySelectionEnum)[keyof typeof AgeingPartySelectionEnum];

export const AgeingTransactionSideEnum = {
  PURCHASE: 'purchase',
  SALE: 'sale',
  BOTH: 'both',
} as const;

export type AgeingTransactionSide =
  (typeof AgeingTransactionSideEnum)[keyof typeof AgeingTransactionSideEnum];

export const AgeingReportLayoutEnum = {
  DETAIL: 'detail',
  SUMMARY: 'summary',
} as const;

export type AgeingReportLayout =
  (typeof AgeingReportLayoutEnum)[keyof typeof AgeingReportLayoutEnum];

export const AgeingEefcFilterEnum = {
  EEFC: 'eefc',
  NON_EEFC: 'non_eefc',
  ALL: 'all',
} as const;

export type AgeingEefcFilter =
  (typeof AgeingEefcFilterEnum)[keyof typeof AgeingEefcFilterEnum];

export const AgeingScopeEnum = {
  BRANCH: 'branch',
  CONSOLIDATED: 'consolidated',
} as const;

export type AgeingScope =
  (typeof AgeingScopeEnum)[keyof typeof AgeingScopeEnum];

export const AGEING_BUCKET_OPTIONS = [
  { id: 'd1_10', label: '1 - 10 Days' },
  { id: 'd11_20', label: '11 - 20 Days' },
  { id: 'd21_30', label: '21 - 30 Days' },
  { id: 'd31_45', label: '31 - 45 Days' },
  { id: 'd46_90', label: '46 - 90 Days' },
  { id: 'd91_180', label: '91 - 180 Days' },
  { id: 'd181_365', label: '181 - 365 Days' },
  { id: 'above365', label: 'Above 365 Days' },
] as const;

export const AGEING_REPORT_TEXT = {
  title: 'Ageing Report',
  description:
    'Outstanding purchase and sale bills grouped into ageing buckets as of the end date.',
  branchHeading: 'Branch',
  partyHeading: 'Party',
  accountHeading: 'Account',
  entityTypeHeading: 'Entity type',
  selectTypeHeading: 'Select type',
  transactionHeading: 'Transactions',
  layoutHeading: 'Report format',
  ageingHeading: 'Ageing days',
  eefcHeading: 'EEFC',
  scopeHeading: 'Scope',
  msme: 'MSME',
  others: 'Others',
  all: 'All',
  purchase: 'Purchase',
  sale: 'Sale',
  both: 'Both',
  detail: 'Detail',
  summary: 'Summary',
  eefc: 'EEFC',
  nonEefc: 'Non EEFC',
  branchScope: 'Branch',
  consolidated: 'Consolidated',
  allEntityTypes: 'All entity types',
  ageingHint: 'Leave unselected to include every bucket.',
  view: 'View',
  reset: 'Reset',
  appliedPrefix: 'Showing',
  asOn: 'As on',
  reportViewTitle: 'Report',
  xlsx: 'Excel',
  csv: 'CSV',
  download: 'Download',
  loadError: 'The report could not be loaded.',
  empty: 'No outstanding transactions.',
} as const;
