export const FLM8_DEFAULT_PRODUCT_CODE = 'CN';

export const Flm8ReportViewEnum = {
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal',
} as const;

export type Flm8ReportView =
  (typeof Flm8ReportViewEnum)[keyof typeof Flm8ReportViewEnum];

export const Flm8ProfileTypeEnum = {
  FFMC: 'FFMC',
  AD: 'AD',
} as const;

export type Flm8ProfileType =
  (typeof Flm8ProfileTypeEnum)[keyof typeof Flm8ProfileTypeEnum];

export const FLM8_CN_STATEMENT_TEXT = {
  title: 'FLM 8 - CN Statement',
  description:
    'Currency-note stock statement by branch for a date range. Values are foreign-currency quantities. Counter transfers are excluded.',
  reportViewTitle: 'Report View',
  reportViewDescription:
    'Vertical view matches FLM 1 (particulars as rows, currencies as wrapping columns). Horizontal view lists currency as a column.',
  download: 'Download',
  loadError: 'Failed to load report data. Please try again.',
  xlsx: 'XLSX',
  csv: 'CSV',
  appliedPrefix: 'Applied',
  all: 'All',
  branchHeading: 'Branch',
  productHeading: 'Product',
  profileTypeHeading: 'Profile type',
  apConnectHeading: 'AP Connect',
  apConnectHint: 'Show currency as Name(Country) from masters. AD only.',
  dateHeading: 'Date',
  emptyMessage: 'No CN stock or movement',
  selectProductHint:
    'Select a product and FFMC or AD before viewing the report.',
  selectProfileTypeHint: 'Select FFMC or AD.',
  selectProfileType: 'Select FFMC or AD',
  ffmc: 'FFMC',
  ad: 'AD',
  selectProduct: 'Select Product',
  reset: 'Reset',
  viewReport: 'View Report',
  selected: 'Selected',
  enabled: 'Enabled',
  disabled: 'Disabled',
  verticalView: 'Vertical',
  horizontalView: 'Horizontal',
  lockData: 'Lock Data',
  lockDataTitle: 'Lock FLM 8 data',
  lockDataDescription:
    'Lock punching through the applied report end date for the selected branches. This cannot be undone; you can only advance to a later date later.',
  lockDataConfirm: 'Lock data',
  lockDataCancel: 'Cancel',
  lockDataBranchHeading: 'Branches to lock',
  lockDataWarning:
    'After locking, transaction dates on or before the lock date are blocked for those branches. Monthwise backdate windows that become empty are revoked.',
  lockDataSuccess: 'Data lock applied.',
  lockDataPartialSuccess:
    'Data lock finished with some branches skipped or unchanged.',
  lockDataError: 'Failed to lock FLM 8 data. Please try again.',
  lockDataNoBranches: 'Select at least one branch to lock.',
  lockDataNoEndDate: 'Apply the report with an end date before locking.',
  lockDataThroughPrefix: 'Lock through',
  lockDataThroughSuffix: 'Punching on that date or earlier will be blocked.',
} as const;
