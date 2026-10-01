type ReferenceLike = {
  code?: string | null;
  name?: string | null;
  label?: string | null;
};

/** IANA time zone of the current browser/PC, used for BOD/EOD business dates. */
export const getClientTimeZone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  } catch {
    return 'Asia/Kolkata';
  }
};

/** Current browser/PC clock as ISO-8601 (follows OS date/time changes). */
export const getClientNow = (): string => new Date().toISOString();

/** Calendar date (yyyy-MM-dd) from the browser/PC clock in its local zone. */
export const getClientBusinessDate = (): string => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export const formatDateTime = (
  value?: string | Date | null,
  format = 'DD/MM/YYYY'
): string => {
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

  return format.replace(
    /DD|MM|YYYY|HH|mm|ss/g,
    match => tokens[match] ?? match
  );
};

export const formatReferenceLabel = (value?: ReferenceLike | null): string => {
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
