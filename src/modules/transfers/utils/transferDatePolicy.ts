import {
  getTransactionDatePolicy,
  type TransactionDatePolicy,
} from '@/modules/transactionPolicies/utils/transactionDatePolicy';

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

const maxOfDates = (left?: Date, right?: Date): Date | undefined => {
  if (!left) {
    return right;
  }
  if (!right) {
    return left;
  }
  return left > right ? left : right;
};

const minOfDates = (left?: Date, right?: Date): Date | undefined => {
  if (!left) {
    return right;
  }
  if (!right) {
    return left;
  }
  return left < right ? left : right;
};

export const combineTransferTransactionDatePolicies = (
  policies: TransactionDatePolicy[]
): TransactionDatePolicy => {
  if (policies.length === 0) {
    return getTransactionDatePolicy(null);
  }

  if (policies.length === 1) {
    return policies[0];
  }

  let minDate = policies[0].minDate;
  let maxDate = policies[0].maxDate;

  for (let index = 1; index < policies.length; index += 1) {
    minDate = maxOfDates(minDate, policies[index].minDate);
    maxDate = minOfDates(maxDate, policies[index].maxDate);
  }

  let canPunchTransactions = policies.every(
    policy => policy.canPunchTransactions
  );

  if (minDate && maxDate && minDate > maxDate) {
    canPunchTransactions = false;
  }

  const defaultBase = policies[0].defaultTransactionDate;
  const baseDate = parseDateOnly(defaultBase);
  const defaultTransactionDate = baseDate
    ? formatDateOnly(clampDate(baseDate, minDate, maxDate))
    : '';

  const helperText = policies
    .map(policy => policy.helperText.trim())
    .filter(Boolean)
    .join(' ');

  return {
    canPunchTransactions,
    minDate,
    maxDate,
    defaultTransactionDate,
    helperText,
  };
};
