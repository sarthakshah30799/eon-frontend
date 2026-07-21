const PARTY_PROFILE_ROUTE_TYPE_MAP: Record<string, string> = {
  FOREIGN_CORRESPONDENT: 'foreign-correspondent',
  FOREX_CORRESPONDENT: 'forex-correspondent',
  MISC_PROFILE: 'misc-supplier-profile',
};

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

  const normalizedValue = value.trim();
  const mappedRouteType = PARTY_PROFILE_ROUTE_TYPE_MAP[normalizedValue.toUpperCase()];
  if (mappedRouteType) {
    return mappedRouteType;
  }

  return normalizeDelimitedValue(normalizedValue);
};

export const toPartyProfileApiType = (value?: string | null): string => {
  if (!value) {
    return '';
  }

  const normalizedValue = value.trim().toLowerCase();
  const mappedApiType = Object.entries(PARTY_PROFILE_ROUTE_TYPE_MAP).find(
    ([, routeType]) => routeType === normalizedValue
  )?.[0];

  if (mappedApiType) {
    return mappedApiType;
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
