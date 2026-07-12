const normalizeDelimitedValue = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export const toPartyProfileRouteType = (value?: string | null): string => {
  if (!value) {
    return '';
  }

  if (value.trim().toUpperCase() === 'MISC_PROFILE') {
    return 'misc-supplier-profile';
  }

  return normalizeDelimitedValue(value);
};

export const toPartyProfileApiType = (value?: string | null): string => {
  if (!value) {
    return '';
  }

  if (value.trim().toLowerCase() === 'misc-supplier-profile') {
    return 'MISC_PROFILE';
  }

  return value
    .trim()
    .replace(/-/g, '_')
    .replace(/\s+/g, '_')
    .toUpperCase();
};

export const toPartyProfileDisplayLabel = (
  value?: string | null
): string => {
  const normalized = value?.trim().replace(/[_-]+/g, ' ');
  return normalized ? normalized.toUpperCase() : 'PARTY PROFILE';
};

export const formatPartyProfileLabel = (
  value?: string | null
): string => {
  const normalized = value?.trim().replace(/[-_]+/g, ' ');

  if (!normalized) {
    return 'Party Profile';
  }

  return normalized.toUpperCase();
};
