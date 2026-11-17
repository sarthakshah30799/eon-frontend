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
  availableAdvances: (params?: unknown) =>
    [
      ...ADVANCE_ADJUSTMENT_QUERY_KEYS.all,
      'available-advances',
      params,
    ] as const,
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
  RECEIPT_LABEL: 'Advance Receipt',
  ADJUSTMENT_AMOUNT_LABEL: 'Adjustment Amount',
  BALANCE_AMOUNT_LABEL: 'Balance Amount',
  RECEIPT_SECTION: 'Advance Receipt & Amounts',
};
