export const ADVANCE_REFUND_QUERY_KEYS = {
  all: ['advance-refunds'] as const,
  lists: () => [...ADVANCE_REFUND_QUERY_KEYS.all, 'list'] as const,
  list: (params?: unknown) =>
    [...ADVANCE_REFUND_QUERY_KEYS.lists(), params] as const,
  details: () => [...ADVANCE_REFUND_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ADVANCE_REFUND_QUERY_KEYS.details(), id] as const,
  availableAdvances: (params?: unknown) =>
    [...ADVANCE_REFUND_QUERY_KEYS.all, 'available-advances', params] as const,
};

export const ADVANCE_REFUND_TEXT = {
  TITLE: 'Advance Refunds',
  CREATE_TITLE: 'New Advance Refund',
  DETAIL_TITLE: 'Advance Refund Details',
  BREADCRUMB_LIST: 'Advance Refunds',
  BREADCRUMB_CREATE: 'Create',
  BREADCRUMB_DETAIL: 'Details',
  EMPTY_ITEMS: 'No advance receipts selected for refund',
  NO_RECORDS: 'No advance refunds found',
  SUCCESS_CREATED: 'Advance refund created successfully',
  SUCCESS_HONOURED: 'Advance refund honoured and paid successfully',
  PRINT_COPY: 'Print Copy',
  PRINT_ORIGINAL_HINT: 'Next print will be Original Copy',
  PRINT_DUPLICATE_HINT: 'Next print will be Duplicate Copy',
  PRINT_HISTORY: 'Print history',
  PRINTED_BY_UNKNOWN: 'Unknown user',
};

export const ADVANCE_REFUND_PRINT_TEXT = {
  title: 'ADVANCE REFUND VOUCHER',
  originalCopy: 'Original Copy',
  duplicateCopy: 'Duplicate Copy',
  documentNo: 'DOCUMENT NO',
  date: 'DATE',
  party: 'Party',
  type: 'Type',
  chqNo: 'Chq No',
  dated: 'Dated',
  panCardNo: 'Pan Card No',
  refundType: 'Refund Type',
  fromWhichBank: 'From Which Bank',
  remark: 'Remark',
  srNo: 'SR. NO',
  partyCol: 'PARTY',
  typeCol: 'TYPE',
  paxName: 'PAX NAME',
  rtDate: 'RT-DATE',
  rtNo: 'RT-NO',
  rtAmount: 'RT-AMOUNT',
  totalAmount: 'TOTAL AMOUNT',
  adjustmentAmount: 'ADJUSTMENT AMOUNT',
  balanceAmount: 'BALANCE AMOUNT',
  refAmount: 'REF AMOUNT',
  preparedBy: 'Prepared by',
  checkedBy: 'Checked By',
  approvedBy: 'Approved by',
  signature: 'Signature',
  noItems: 'No refund items',
  companyFallback: 'Maraekat Infotech Ltd',
  logoFallback: 'MARAEKAT',
  rbiLicNo: 'RBI Lic No',
  popupBlocked: 'Unable to open print window. Please allow popups and try again.',
  printFailed: 'Failed to print advance refund voucher',
  printed: (copyLabel: string) => `${copyLabel} printed successfully`,
};

export const ADVANCE_REFUND_TYPE_OPTIONS = [
  { value: 'REFUND', label: 'Refund (Bank Payout)' },
  { value: 'KNOCK_OFF', label: 'Knock Off (Income / Round-off JV)' },
];

export const ADVANCE_REFUND_PAYOUT_OPTIONS = [
  { value: 'LOCAL_BANK', label: 'Local Branch Bank' },
  { value: 'HO_PAYOUT', label: 'Head Office Payout (Advice)' },
];

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'NEFT', label: 'NEFT' },
  { value: 'RTGS', label: 'RTGS' },
  { value: 'IMPS', label: 'IMPS' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CHEQUE', label: 'Cheque' },
];
