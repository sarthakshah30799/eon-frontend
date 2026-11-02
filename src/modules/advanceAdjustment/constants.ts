export const ADVANCE_ADJUSTMENT_QUERY_KEYS = {
  all: ['advance-adjustments'] as const,
  lists: () => [...ADVANCE_ADJUSTMENT_QUERY_KEYS.all, 'list'] as const,
  list: (params?: unknown) =>
    [...ADVANCE_ADJUSTMENT_QUERY_KEYS.lists(), params] as const,
  details: () => [...ADVANCE_ADJUSTMENT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) =>
    [...ADVANCE_ADJUSTMENT_QUERY_KEYS.details(), id] as const,
  outstandingSales: (params?: unknown) =>
    [...ADVANCE_ADJUSTMENT_QUERY_KEYS.all, 'outstanding-sales', params] as const,
};

export const ADVANCE_ADJUSTMENT_TEXT = {
  TITLE: 'Advance Adjustments',
  CREATE_TITLE: 'New Advance Adjustment',
  DETAIL_TITLE: 'Advance Adjustment Details',
  BREADCRUMB_LIST: 'Advance Adjustments',
  BREADCRUMB_CREATE: 'Create',
  BREADCRUMB_DETAIL: 'Details',
  EMPTY_ITEMS: 'No outstanding sales selected for adjustment',
  NO_RECORDS: 'No advance adjustments found',
  SUCCESS_CREATED: 'Advance adjustment created successfully',
  PRINT_COPY: 'Print Copy',
  PRINT_ORIGINAL_HINT: 'Next print will be Original Copy',
  PRINT_DUPLICATE_HINT: 'Next print will be Duplicate Copy',
  PRINT_HISTORY: 'Print history',
  PRINTED_BY_UNKNOWN: 'Unknown user',
};

export const ADVANCE_ADJUSTMENT_PRINT_TEXT = {
  title: 'ADVANCE ADJUSTMENT MEMO',
  originalCopy: 'Original Copy',
  duplicateCopy: 'Duplicate Copy',
  documentNo: 'Doc. No.',
  date: 'Date',
  party: 'Party',
  forAccount: 'For Account',
  advReceiptNo: 'Adv. Receipt No',
  adjAmount: 'Adj. Amount',
  narration: 'Narration',
  srNo: 'Sr. No.',
  type: 'Type',
  no: 'No',
  code: 'Code',
  agentCode: 'Agent Code',
  passenger: 'Passenger',
  amount: 'Amount',
  total: 'Total',
  preparedBy: 'Prepared by',
  checkedBy: 'Checked By',
  approvedBy: 'Approved by',
  signature: 'Signature',
  noItems: 'No adjustment items',
  companyFallback: 'Maraekat Infotech Ltd',
  logoFallback: 'MARAEKAT',
  rbiLicNo: 'RBI Lic No',
  popupBlocked:
    'Unable to open print window. Please allow popups and try again.',
  printFailed: 'Failed to print advance adjustment memo',
  printed: (copyLabel: string) => `${copyLabel} printed successfully`,
};
