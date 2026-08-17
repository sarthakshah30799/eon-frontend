import type { VoucherSnapshot } from './types';

export const formatAdvanceAccountLabel = (snapshot?: VoucherSnapshot | null) => {
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
