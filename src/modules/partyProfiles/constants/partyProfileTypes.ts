export type PartyProfileType = string;

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

  return normalizeDelimitedValue(value);
};

export const toPartyProfileApiType = (value?: string | null): string => {
  if (!value) {
    return '';
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
