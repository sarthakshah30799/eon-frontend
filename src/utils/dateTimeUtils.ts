type ReferenceLike = {
  code?: string | null;
  name?: string | null;
  label?: string | null;
};

export const formatDateTime = (value?: string | Date | null): string => {
  if (!value) {
    return '-';
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString();
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
