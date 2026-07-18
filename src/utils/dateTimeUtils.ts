type ReferenceLike = {
  code?: string | null;
  name?: string | null;
  label?: string | null;
};

export const formatDateTime = (value?: string | Date | null, format = 'DD/MM/YYYY'): string => {
  if (!value) {
    return '-';
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  const tokens: Record<string, string> = {
    DD: pad(date.getDate()),
    MM: pad(date.getMonth() + 1),
    YYYY: String(date.getFullYear()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
  };

  return format.replace(/DD|MM|YYYY|HH|mm|ss/g, match => tokens[match] ?? match);
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
