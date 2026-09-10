import {
  TransactionPaymentMethodEnum,
  type TransactionPaymentMethod,
} from '@/modules/transactions';
import type {
  VoucherAccountMode,
  VoucherDirection,
  VoucherSnapshot,
} from './types';

/** Payment method implied by Receipt/Payment A/C Type (never blank for party vouchers). */
export const paymentMethodForVoucherAccountMode = (
  accountMode: VoucherAccountMode | '' | null | undefined
): TransactionPaymentMethod | '' => {
  if (accountMode === 'CASH' || accountMode === 'PETTY_CASH') {
    return TransactionPaymentMethodEnum.CASH;
  }
  if (accountMode === 'CREDIT_CARD') {
    return TransactionPaymentMethodEnum.CARD;
  }
  if (accountMode === 'BANK_CHEQUE') {
    return TransactionPaymentMethodEnum.CHEQUE;
  }
  return '';
};

export const VOUCHER_ITEM_TYPE_ACCOUNT = 'ACCOUNT';

export const isVoucherAccountItemTypeValue = (value?: string | null) =>
  String(value ?? '')
    .trim()
    .toUpperCase() === VOUCHER_ITEM_TYPE_ACCOUNT;

export const isVoucherBillItemTypeValue = (value?: string | null) => {
  const normalized = String(value ?? '')
    .trim()
    .toUpperCase();
  return (
    (normalized.startsWith('PURCHASE_') || normalized.startsWith('SALE_')) &&
    !isVoucherAccountItemTypeValue(normalized)
  );
};

export const voucherBillDirection = (
  value?: string | null
): VoucherDirection | null => {
  const normalized = String(value ?? '')
    .trim()
    .toUpperCase();
  if (normalized.startsWith('SALE_')) return 'CREDIT';
  if (normalized.startsWith('PURCHASE_')) return 'DEBIT';
  return null;
};

export const getVoucherItemTypeValueById = (
  itemTypeOptionId: string,
  options: Array<{ id: string; value: string }>
) =>
  options
    .find(option => option.id === itemTypeOptionId)
    ?.value.trim()
    .toUpperCase() ?? '';

export const formatOutstandingBillPassengerLabel = (
  snapshot?: Record<string, unknown> | null
) => {
  const name = snapshot?.panHolderName;
  return typeof name === 'string' && name.trim() ? name.trim() : '-';
};

export const formatAdvanceAccountLabel = (
  snapshot?: VoucherSnapshot | null
) => {
  const code = snapshot?.code ?? snapshot?.key ?? '';
  const name = snapshot?.label ?? snapshot?.name ?? '';
  if (code && name) {
    return `${code} - ${name}`;
  }

  return name || code || '';
};

export const formatVoucherDateInput = (value?: string | Date | null) => {
  if (!value) {
    return '';
  }

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
};

export const isVoucherIndividualSelection = ({
  entityType,
  isIndividual,
}: {
  entityType?: { value?: string | number; label?: string } | null;
  isIndividual?: boolean | null;
}) => {
  if (isIndividual) {
    return true;
  }

  return [entityType?.value, entityType?.label].some(token => {
    const normalized = String(token ?? '')
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, '_');
    return normalized === 'INDIVIDUAL';
  });
};
