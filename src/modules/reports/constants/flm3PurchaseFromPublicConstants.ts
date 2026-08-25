export const FLM3_DEFAULT_PRODUCT_CODE = 'CN';

export const Flm3ReportViewEnum = {
  NORMAL: 'normal',
  EXTENDED: 'extended',
} as const;

export type Flm3ReportView =
  (typeof Flm3ReportViewEnum)[keyof typeof Flm3ReportViewEnum];

export const FLM3_PURCHASE_FROM_PUBLIC_TEXT = {
  title: 'FLM 3 - Purchase from Public',
  description:
    'Purchase-from-public register by transaction date. One row per exchange item. Product defaults to CN.',
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
  productHeading: 'Product',
  dateHeading: 'Date',
  emptyMessage: 'No purchase from public found for the selected filters.',
  loadingMessage: 'Loading report...',
  selectProductHint: 'Select a product before viewing the report.',
  selectProduct: 'Select Product',
  reset: 'Reset',
  viewReport: 'View Report',
  selected: 'Selected',
  normalView: 'Normal',
  extendedView: 'Extended',
} as const;
