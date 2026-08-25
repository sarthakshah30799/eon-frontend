export const FLM5_DEFAULT_PRODUCT_CODE = 'CN';

export const Flm5ReportViewEnum = {
  NORMAL: 'normal',
  EXTENDED: 'extended',
} as const;

export type Flm5ReportView =
  (typeof Flm5ReportViewEnum)[keyof typeof Flm5ReportViewEnum];

export const FLM5_SALES_TO_PUBLIC_TEXT = {
  title: 'FLM 5 - Sales to Public',
  description:
    'Sales-to-public register by transaction date. Corporate/individual sale profiles only. One row per exchange item. Product defaults to CN.',
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
  emptyMessage: 'No sales to public found for the selected filters.',
  loadingMessage: 'Loading report...',
  selectProductHint: 'Select a product before viewing the report.',
  selectProduct: 'Select Product',
  reset: 'Reset',
  viewReport: 'View Report',
  selected: 'Selected',
  normalView: 'Normal',
  extendedView: 'Extended',
} as const;
