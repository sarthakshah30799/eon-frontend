type ReferenceLike = {
  code?: string | null;
  name?: string | null;
  label?: string | null;
};

export const formatDateTime = (value?: string | Date | null, dateOnly = false): string => {
  if (!value) {
    return '-';
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  if (dateOnly) {
    return date.toLocaleDateString('en-GB');
  }

  return date.toLocaleString('en-GB');
};

export const formatReferenceLabel = (
  value?: ReferenceLike | null
): string => {
  if (!value) {
    return '-';
  }

  if (value.label) {
    return value.label;
  }

  if (value.code && value.name) {
    return `${value.code} - ${value.name}`;
  }

  return value.name || value.code || '-';
};
