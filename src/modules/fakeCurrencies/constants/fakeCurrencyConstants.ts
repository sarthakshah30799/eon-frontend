export const FAKE_CURRENCY_PRINT_TEXT = {
  heading: 'Print Copy',
  originalHint: 'Print the original copy for this saved transaction.',
  duplicateHint: 'Print the duplicate copy for this saved transaction.',
  printCopy: 'Print Copy',
  preparing: 'Preparing Print...',
  printed: (label: string) => `${label} sent to printer`,
  printFailed: 'Failed to print fake currency copy',
  popupBlocked:
    'Unable to open print window. Please allow pop-ups and try again.',
  saveBeforePrint: 'Save the transaction before printing.',
} as const;
