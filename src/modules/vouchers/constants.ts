import type { VoucherType } from './types';

export const VOUCHER_LABELS: Record<VoucherType, string> = {
  RECEIPT: 'Receipt',
  PAYMENT: 'Payment',
  JOURNAL: 'Journal Voucher',
  DEPOSIT_WITHDRAWAL: 'Deposit / Withdrawal',
};

export const VOUCHER_LIST_TEXT = {
  description: (label: string) => `Immutable ${label.toLowerCase()} records`,
  add: (label: string) => `Add ${label}`,
  empty: (label: string) => `No ${label.toLowerCase()} records found.`,
  number: 'Number',
  transactionDate: 'Date',
  party: 'Party',
  amount: 'Amount',
  accountMode: 'Account Mode',
  actions: 'Actions',
  view: 'View',
} as const;

export const VOUCHER_FORM_TEXT = {
  panNumber: 'PAN Number',
  panName: 'PAN Name',
  panDob: 'PAN DOB',
  panNumberPlaceholder: 'Enter PAN number',
  panNamePlaceholder: 'Enter name on PAN card',
  panDobPlaceholder: 'Select DOB',
  panVerifyIncomplete:
    'Enter PAN number, name, and DOB, then press Enter to verify.',
  panVerifyChecking: 'Verifying PAN details...',
  panVerifySuccess: 'PAN details verified successfully',
  panVerifyFailed:
    'PAN verification failed. Please review the entered details.',
  paymentMode: 'Payment Mode',
  electronicPaymentHint:
    'Cheque number is not required for UPI, NEFT, or RTGS.',
} as const;

export const DEPOSIT_WITHDRAWAL_TEXT = {
  depositedIn: 'Deposited in',
  withdrawalFrom: 'Withdrawal from',
  handlingFee: 'Handling fees',
  typeAccount: 'Account',
  feeAccountHint: 'Handling fee control account',
  balanceError:
    'Withdrawal from must equal Deposited in, or Deposited in plus Handling fee.',
  bankRequired:
    'At least one of Deposited in or Withdrawal from must be a Bank Ledger account.',
} as const;

export const OUTSTANDING_BILL_TEXT = {
  titleReceipt: 'Select Outstanding Bills (Receipt)',
  titlePayment: 'Select Outstanding Bills (Payment)',
  description: (count: number, itemTypeLabel: string) =>
    itemTypeLabel
      ? `${count} outstanding bill${count === 1 ? '' : 's'} for ${itemTypeLabel}. Select one or more to settle.`
      : `${count} outstanding bill${count === 1 ? '' : 's'} for this party. Select one or more to settle.`,
  empty: 'No outstanding bills found for this party, branch, and bill type.',
  missingContext:
    'Select party, branch, counter, transaction date, and bill type before choosing outstanding bills.',
  searchPlaceholder: 'Search bill number',
  number: 'Bill No',
  date: 'Date',
  passenger: 'Passenger',
  finalAmount: 'Final Amount',
  paidAmount: 'Paid',
  outstanding: 'Outstanding',
  continueLabel: 'Apply Bills',
  cancelLabel: 'Cancel',
  selectedSummary: (count: number, total: string) =>
    `${count} selected | Combined outstanding ${total}`,
  selectAll: 'Select all outstanding bills',
  selectOutstanding: 'Select outstanding',
  settledBill: 'Settled Bill',
} as const;

export const AVAILABLE_ADVANCE_TEXT = {
  titleReceipt: 'Select Receipt Advances',
  titlePayment: 'Select Payment Advances',
  description: (
    count: number,
    accountLabel: string,
    remainingAmount: string
  ) =>
    accountLabel
      ? `${count} available advance${count === 1 ? '' : 's'} against ${accountLabel}. Select one or more to apply against remaining ${remainingAmount}.`
      : `${count} available advance${count === 1 ? '' : 's'} for this party. Select one or more to apply against remaining ${remainingAmount}.`,
  empty:
    'No available advances found for this party, account, and payment mode.',
  missingContext:
    'Select party, branch, counter, and transaction date before choosing an advance.',
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
  DEPOSIT_WITHDRAWAL: '/deposit-withdrawals',
};

export const createVoucherIdempotencyKey = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;
