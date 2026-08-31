export const TRANSFER_PRINT_TEXT = {
  printCopy: 'Print Copy',
  preparing: 'Preparing Print...',
  printed: (label: string) => `${label} sent to printer`,
  printFailed: 'Failed to print transfer copy',
  popupBlocked:
    'Unable to open print window. Please allow pop-ups and try again.',
} as const;
