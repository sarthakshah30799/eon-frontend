import type {
  ICountryGroup,
  ICountryGroupFormValues,
  ICreateCountryGroup,
} from '../types';

export const createEmptyCountryGroupFormValues =
  (): ICountryGroupFormValues => ({
    name: '',
    code: '',
    sellLimitAmount: '',
    sellLimitCurrencyId: '',
    minTravelDays: '',
    maxTravelDays: '',
  });

export const mapCountryGroupToFormValues = (
  group: ICountryGroup
): ICountryGroupFormValues => ({
  name: group.name,
  code: group.code,
  sellLimitAmount:
    group.sellLimitAmount === null || group.sellLimitAmount === undefined
      ? ''
      : String(group.sellLimitAmount),
  sellLimitCurrencyId: group.sellLimitCurrencyId ?? '',
  minTravelDays:
    group.minTravelDays === null || group.minTravelDays === undefined
      ? ''
      : String(group.minTravelDays),
  maxTravelDays:
    group.maxTravelDays === null || group.maxTravelDays === undefined
      ? ''
      : String(group.maxTravelDays),
});

const parseNullableNumber = (value: string): number | null => {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  const nextValue = Number(trimmedValue);
  return Number.isNaN(nextValue) ? null : nextValue;
};

export const sanitizeCountryGroupFormValues = (
  values: ICountryGroupFormValues
): ICreateCountryGroup => ({
  name: values.name.trim(),
  code: values.code.trim().toUpperCase(),
  sellLimitAmount: parseNullableNumber(values.sellLimitAmount),
  sellLimitCurrencyId: values.sellLimitCurrencyId.trim() || null,
  minTravelDays: parseNullableNumber(values.minTravelDays),
  maxTravelDays: parseNullableNumber(values.maxTravelDays),
});

export const formatCountryGroupSellLimit = (group: ICountryGroup): string => {
  if (
    !group.sellLimitAmount ||
    !group.sellLimitCurrency?.currencyCode ||
    !group.sellLimitCurrency?.currencyName
  ) {
    return '—';
  }

  return `${Number(group.sellLimitAmount).toFixed(2)} ${group.sellLimitCurrency.currencyCode}`;
};

export const formatNullableInteger = (
  value: number | null | undefined
): string => (value === null || value === undefined ? '—' : String(value));
