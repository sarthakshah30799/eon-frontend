import type { IPolicyContext } from '@/modules/auth/types';

export interface TransactionDatePolicy {
  canPunchTransactions: boolean;
  minDate?: Date;
  maxDate?: Date;
  defaultTransactionDate: string;
  helperText: string;
}

const parseDateOnly = (value: string | null | undefined): Date | undefined => {
  const normalized = String(value ?? '').trim();
  if (!normalized) {
    return undefined;
  }

  const parsed = new Date(`${normalized.slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const formatDateOnly = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const clampDate = (date: Date, min?: Date, max?: Date): Date => {
  if (min && date < min) {
    return min;
  }

  if (max && date > max) {
    return max;
  }

  return date;
};

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
};

const maxOfDates = (left?: Date, right?: Date): Date | undefined => {
  if (!left) {
    return right;
  }
  if (!right) {
    return left;
  }
  return left > right ? left : right;
};

export const getTransactionDatePolicy = (
  policyContext?: IPolicyContext | null
): TransactionDatePolicy => {
  const activeLock =
    policyContext?.activeMonthlyLock ??
    policyContext?.activeBackdateWindow ??
    null;
  const currentBusinessDate = policyContext?.currentBusinessDate ?? '';
  const openBusinessDate = policyContext?.openBusinessDate ?? '';
  const workflowState = policyContext?.workflowState ?? '';
  const lockedThroughDate =
    policyContext?.transactionDataLock?.lockedThroughDate;
  const dataLockMinDate = lockedThroughDate
    ? (() => {
        const lockedThrough = parseDateOnly(lockedThroughDate);
        return lockedThrough ? addDays(lockedThrough, 1) : undefined;
      })()
    : undefined;

  let canPunchTransactions =
    Boolean(activeLock) || workflowState === 'PENDING_EOD';
  let minDate = activeLock?.fromDate
    ? parseDateOnly(activeLock.fromDate)
    : workflowState === 'PENDING_EOD'
      ? parseDateOnly(openBusinessDate || currentBusinessDate)
      : undefined;
  minDate = maxOfDates(minDate, dataLockMinDate);

  const maxDate = activeLock?.toDate
    ? parseDateOnly(activeLock.toDate)
    : workflowState === 'PENDING_EOD'
      ? parseDateOnly(openBusinessDate || currentBusinessDate)
      : undefined;

  if (minDate && maxDate && minDate > maxDate) {
    canPunchTransactions = false;
  }

  const baseDate = parseDateOnly(
    policyContext?.transactionDate || openBusinessDate || currentBusinessDate
  );
  const defaultTransactionDate = baseDate
    ? formatDateOnly(clampDate(baseDate, minDate, maxDate))
    : '';

  const helperText = lockedThroughDate
    ? `Data locked through ${lockedThroughDate}. Transaction dates must be on or after ${
        dataLockMinDate ? formatDateOnly(dataLockMinDate) : lockedThroughDate
      }.`
    : workflowState === 'PENDING_EOD'
      ? `EOD is pending for ${openBusinessDate || 'the previous business date'}. Transactions must use that date.`
      : '';

  return {
    canPunchTransactions,
    minDate,
    maxDate,
    defaultTransactionDate,
    helperText,
  };
};
