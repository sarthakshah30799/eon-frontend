export const FLM1_DEFAULT_PRODUCT_CODE = 'CN';

export const FLM1_DAILY_CN_SUMMARY_TEXT = {
  title: 'FLM1 Daily CN Summary',
  description:
    'One-day currency-note stock statement by branch. Values are foreign-currency quantities. Counter transfers are excluded.',
  reportViewTitle: 'Report View',
  reportViewDescription:
    'Each selected branch is a group. Currency columns wrap using the company Reports setting (default 5).',
  download: 'Download',
  loadError: 'Failed to load report data. Please try again.',
  xlsx: 'XLSX',
  csv: 'CSV',
  appliedPrefix: 'Applied',
  all: 'All',
  branchHeading: 'Branch',
  productHeading: 'Product',
  dateHeading: 'Date',
  emptyMessage: 'No CN stock or movement',
  selectProductHint: 'Select a product before viewing the report.',
  selectProduct: 'Select Product',
  reset: 'Reset',
  viewReport: 'View Report',
  selected: 'Selected',
} as const;
