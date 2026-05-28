export const createSafeId = (value: string): string =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
