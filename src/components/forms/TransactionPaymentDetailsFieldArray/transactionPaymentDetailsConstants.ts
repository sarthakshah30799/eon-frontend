export const TRANSACTION_PAYMENT_TEXT = {
  settlementSource: 'Settlement Source',
  paymentMode: 'Payment Mode',
  cashNotAllowed: 'Cash payment is not allowed for this transaction type.',
  normal: 'Normal',
  advance: 'Advance',
  receiptAdvance: 'Receipt Advance',
  paymentAdvance: 'Payment Advance',
  selectAdvance: 'Select available advances',
  loadingAdvances: 'Loading advances...',
  availableCount: (count: number) =>
    `${count} available advance${count === 1 ? '' : 's'}`,
  selectedAdvance: (number: string, amount: string) =>
    `${number} | Available ${amount}`,
  missingAdvanceContext: 'Select party, branch, counter, and date first',
  duplicateAdvance: 'This advance is already selected in this transaction',
  advanceControlAccount: 'Advance Control Account',
  availableAmountForRow: 'Available amount for this row',
  remainingAfterRow: 'Remaining after this row',
  electronicPaymentHint:
    'Cheque details are not required for UPI, NEFT, or RTGS.',
  electronicNotAllowedForAdvance:
    'UPI, NEFT, and RTGS are not allowed for advance settlement',
} as const;

export const SETTLEMENT_SOURCE_OPTIONS = [
  { value: 'NORMAL', label: TRANSACTION_PAYMENT_TEXT.normal },
  { value: 'ADVANCE', label: TRANSACTION_PAYMENT_TEXT.advance },
];
