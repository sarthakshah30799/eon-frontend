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
