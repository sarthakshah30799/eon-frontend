export const Flm8Ad2ReportFormatEnum = {
  CURRENCY: 'currency',
  PURPOSE: 'purpose',
  PARTY: 'party',
} as const;

export type Flm8Ad2ReportFormat =
  (typeof Flm8Ad2ReportFormatEnum)[keyof typeof Flm8Ad2ReportFormatEnum];

export const FLM8_AD2_TEXT = {
  title: 'FLM 8 - AD 2',
  description:
    'Currency-wise opening, purchases, and sales, the same quantities split by purpose, or parties onboarded in the selected dates.',
  dateHeading: 'Date',
  branchHeading: 'Branch',
  reportFormatHeading: 'Report format',
  currencyDetails: 'Currency details',
  purposeDetails: 'Purpose details',
  partyDetails: 'Party details',
  apConnect: 'APConnect',
  apConnectHint: 'Show the full currency name instead of the currency code.',
  view: 'View',
  reset: 'Reset',
  appliedPrefix: 'Showing',
  all: 'All',
  reportViewTitle: 'Report',
  xlsx: 'Excel',
  csv: 'CSV',
  download: 'Download',
  loadError: 'The report could not be loaded.',
  empty: 'No rows for the selected filters.',
  purposePending:
    'Purpose details will be added when the layout is provided.',
} as const;
