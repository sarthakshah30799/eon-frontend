export const TRANSFER_PRINT_TEXT = {
  printCopy: 'Print Copy',
  preparing: 'Preparing Print...',
  printed: (label: string) => `${label} sent to printer`,
  printFailed: 'Failed to print transfer copy',
  popupBlocked:
    'Unable to open print window. Please allow pop-ups and try again.',
} as const;

export const TRANSFER_LIST_TEXT = {
  search: 'Search',
  searchPlaceholder: 'Search transfer number',
  status: 'Status',
  statusPlaceholder: 'All Statuses',
  emptyMessage: 'No transfers found.',
} as const;

export const TRANSFER_FORM_TEXT = {
  cannotPunchTransactions:
    'Transfers cannot be punched for this workplace date. Complete day start (BOD) for the active branch/counter, or check monthwise locking / backdate window.',
  noCreatePermission:
    'You do not have permission to create transfers for this page.',
  noClosingStockBalance:
    'Source branch/counter/currency has no closing stock balance, so hold cost rate is unavailable.',
  noClosingStockBalanceForCurrencies: (currencyLabels: string[]) =>
    currencyLabels.length === 1
      ? `Source branch/counter has no closing stock balance for ${currencyLabels[0]}, so hold cost rate is unavailable.`
      : `Source branch/counter has no closing stock balance for ${currencyLabels.join(', ')}, so hold cost rate is unavailable.`,
  holdCostLoading: 'Checking source counter hold cost...',
} as const;
