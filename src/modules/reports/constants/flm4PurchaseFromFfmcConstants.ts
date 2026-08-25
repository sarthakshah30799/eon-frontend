export const FLM4_DEFAULT_PRODUCT_CODE = 'CN';

export const Flm4ReportViewEnum = {
  NORMAL: 'normal',
  EXTENDED: 'extended',
} as const;

export type Flm4ReportView =
  (typeof Flm4ReportViewEnum)[keyof typeof Flm4ReportViewEnum];

export const FLM4_PURCHASE_FROM_FFMC_TEXT = {
  title: 'FLM 4 - Purchase from FFMC',
  description:
    'Purchase-from-FFMC register by transaction date. Includes all purchase profiles except corporate/individual. One row per exchange item. Product defaults to CN.',
  reportViewTitle: 'Report View',
  reportViewDescription:
    'Normal view lists certificate details. Extended view adds net amount and payment split on the first item of each transaction.',
  download: 'Download',
  loadError: 'Failed to load report data. Please try again.',
  xlsx: 'XLSX',
  csv: 'CSV',
  appliedPrefix: 'Applied',
  all: 'All',
  branchHeading: 'Branch',
  profileHeading: 'Profile',
  productHeading: 'Product',
  dateHeading: 'Date',
  emptyMessage: 'No purchase from FFMC found for the selected filters.',
  loadingMessage: 'Loading report...',
  selectProductHint: 'Select a product before viewing the report.',
  selectProduct: 'Select Product',
  reset: 'Reset',
  viewReport: 'View Report',
  selected: 'Selected',
  normalView: 'Normal',
  extendedView: 'Extended',
} as const;
