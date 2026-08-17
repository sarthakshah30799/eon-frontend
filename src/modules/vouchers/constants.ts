import type { VoucherType } from './types';

export const VOUCHER_LABELS: Record<VoucherType, string> = {
  RECEIPT: 'Receipt',
  PAYMENT: 'Payment',
  JOURNAL: 'Journal Voucher',
};

export const VOUCHER_FORM_TEXT = {
  panNumber: 'PAN Number',
  panName: 'PAN Name',
  panDob: 'PAN DOB',
  panNumberPlaceholder: 'Enter PAN number',
  panNamePlaceholder: 'Enter name on PAN card',
  panDobPlaceholder: 'Select DOB',
  panVerifyIncomplete: 'Enter PAN number, name, and DOB, then press Enter to verify.',
  panVerifyChecking: 'Verifying PAN details...',
  panVerifySuccess: 'PAN details verified successfully',
  panVerifyFailed: 'PAN verification failed. Please review the entered details.',
} as const;

export const AVAILABLE_ADVANCE_TEXT = {
  titleReceipt: 'Select Receipt Advances',
  titlePayment: 'Select Payment Advances',
  description: (count: number, accountLabel: string, remainingAmount: string) =>
    accountLabel
      ? `${count} available advance${count === 1 ? '' : 's'} against ${accountLabel}. Select one or more to apply against remaining ${remainingAmount}.`
      : `${count} available advance${count === 1 ? '' : 's'} for this party. Select one or more to apply against remaining ${remainingAmount}.`,
  empty: 'No available advances found for this party, account, and payment mode.',
  missingContext: 'Select party, branch, counter, and transaction date before choosing an advance.',
  searchPlaceholder: 'Search voucher number or account',
  number: 'Voucher No',
  date: 'Date',
  availableAmount: 'Available Amount',
  account: 'Account',
  chequeNumber: 'Cheque / Ref No',
  continueLabel: 'Apply Advances',
  cancelLabel: 'Cancel',
  selectedSummary: (count: number, total: string) =>
    `${count} selected | Combined available ${total}`,
  selectAll: 'Select all advances',
} as const;

export const VOUCHER_PATHS: Record<VoucherType, string> = {
  RECEIPT: '/receipts',
  PAYMENT: '/payments',
  JOURNAL: '/journal-vouchers',
};

export const createVoucherIdempotencyKey = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
