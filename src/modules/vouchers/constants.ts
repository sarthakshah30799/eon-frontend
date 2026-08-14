import type { VoucherType } from './types';

export const VOUCHER_LABELS: Record<VoucherType, string> = {
  RECEIPT: 'Receipt',
  PAYMENT: 'Payment',
  JOURNAL: 'Journal Voucher',
};

export const VOUCHER_PATHS: Record<VoucherType, string> = {
  RECEIPT: '/receipts',
  PAYMENT: '/payments',
  JOURNAL: '/journal-vouchers',
};

export const createVoucherIdempotencyKey = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
