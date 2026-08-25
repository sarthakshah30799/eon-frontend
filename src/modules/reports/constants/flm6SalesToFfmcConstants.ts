export const FLM6_DEFAULT_PRODUCT_CODE = 'CN';

export const Flm6ReportViewEnum = {
  NORMAL: 'normal',
  EXTENDED: 'extended',
} as const;

export type Flm6ReportView =
  (typeof Flm6ReportViewEnum)[keyof typeof Flm6ReportViewEnum];

export const FLM6_SALES_TO_FFMC_TEXT = {
  title: 'FLM 6 - Sales to FFMC',
  description:
    'Sales-to-FFMC register by transaction date. Includes all sale profiles except corporate/individual. One row per exchange item. Product defaults to CN.',
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
  emptyMessage: 'No sales to FFMC found for the selected filters.',
  loadingMessage: 'Loading report...',
  selectProductHint: 'Select a product before viewing the report.',
  selectProduct: 'Select Product',
  reset: 'Reset',
  viewReport: 'View Report',
  selected: 'Selected',
  normalView: 'Normal',
  extendedView: 'Extended',
} as const;
