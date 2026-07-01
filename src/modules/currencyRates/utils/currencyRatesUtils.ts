import type {
  ICurrencyRate,
  ICurrencyRateComparisonPreview,
  ICurrencyRateGroup,
  ICurrencyRateMargin as ICurrencyRateMarginValue,
  IProductCurrencyRate,
  CurrencyRateMarginType,
} from '../types/currencyRatesTypes';
import type { ICurrencyProfile } from '@/modules/currencyProfile/types';

type CurrencyRateSide = 'buy' | 'sale';

const isPresent = (value: string | null | undefined) =>
  value !== null && value !== undefined && value !== '';

export const formatMarginValue = (
  marginType: CurrencyRateMarginType | '' | null | undefined,
  value: string | null | undefined,
) => {
  if (!isPresent(value)) {
    return '';
  }

  return marginType === 'PERCENT' ? `${value}%` : value;
};

export const getLatestRateForCurrency = (
  rates: ICurrencyRate[],
  currencyId: string,
) => rates.find(rate => rate.currencyId === currencyId) ?? null;

export const getCurrencyPricingGroup = (
  currencies: ICurrencyProfile[],
  currencyId: string,
): ICurrencyRateGroup | null => {
  const pricingGroup = currencies.find(currency => currency.id === currencyId)?.pricingGroup ?? null;

  if (!pricingGroup) {
    return null;
  }

  return {
    id: pricingGroup.id,
    code: pricingGroup.code,
    name: pricingGroup.name,
    description: pricingGroup.description ?? null,
    buyMarginType: (pricingGroup.buyMarginType as CurrencyRateMarginType | null) ?? null,
    buyMarginValue: pricingGroup.buyMarginValue ?? null,
    saleMarginType: (pricingGroup.saleMarginType as CurrencyRateMarginType | null) ?? null,
    saleMarginValue: pricingGroup.saleMarginValue ?? null,
    isActive: pricingGroup.isActive,
    createdAt: pricingGroup.createdAt || '',
    updatedAt: pricingGroup.updatedAt || '',
  };
};

export const getSideBaseRate = (
  rate: ICurrencyRate | null,
  side: CurrencyRateSide,
) => {
  if (!rate) {
    return null;
  }

  if (rate.provider === 'TICKER') {
    return side === 'buy'
      ? rate.baseBuyRate || null
      : rate.baseSaleRate || null;
  }

  return rate.baseRate || rate.baseBuyRate || rate.baseSaleRate || null;
};

export const getStoredBaseRateLabel = (rate: ICurrencyRate | null) => {
  if (!rate) {
    return 'No stored rate yet';
  }

  if (rate.provider === 'TICKER') {
    return `Buy ${rate.baseBuyRate} | Sale ${rate.baseSaleRate}`;
  }

  const baseRate = rate.baseRate || rate.baseBuyRate || rate.baseSaleRate;
  return `Base ${baseRate}`;
};

export const calculateMarginAmount = (
  baseRate: string | null | undefined,
  marginType: CurrencyRateMarginType | '' | null | undefined,
  marginValue: string | null | undefined,
) => {
  if (!isPresent(baseRate) || !marginType || !isPresent(marginValue)) {
    return null;
  }

  const base = Number(baseRate);
  const margin = Number(marginValue);
  if (!Number.isFinite(base) || !Number.isFinite(margin)) {
    return null;
  }

  const amount = marginType === 'PERCENT' ? base * (margin / 100) : margin;
  return amount.toFixed(4);
};

export const calculateFinalRate = (
  baseRate: string | null | undefined,
  marginType: CurrencyRateMarginType | '' | null | undefined,
  marginValue: string | null | undefined,
  direction: 'add' | 'subtract',
) => {
  if (!isPresent(baseRate)) {
    return null;
  }

  const base = Number(baseRate);
  if (!Number.isFinite(base)) {
    return null;
  }

  if (!marginType || !isPresent(marginValue)) {
    return base.toFixed(4);
  }

  const marginAmount = calculateMarginAmount(baseRate, marginType, marginValue);
  if (!marginAmount) {
    return null;
  }

  const amount = Number(marginAmount);
  return (direction === 'subtract' ? base - amount : base + amount).toFixed(4);
};

const resolveAppliedRate = (
  groupFinalRate: string | null,
  overrideFinalRate: string | null,
  overrideMarginType: CurrencyRateMarginType | '' | null | undefined,
  overrideMarginValue: string | null,
) => {
  const hasOverride = Boolean(
    overrideMarginType || isPresent(overrideMarginValue),
  );

  if (hasOverride) {
    return {
      appliedFinalRate: overrideFinalRate,
      appliedSource: overrideFinalRate ? ('override' as const) : ('none' as const),
    };
  }

  return {
    appliedFinalRate: groupFinalRate,
    appliedSource: groupFinalRate ? ('group' as const) : ('none' as const),
  };
};

export const buildCurrencyRateComparisonPreview = ({
  latestRate,
  pricingGroup,
  overrideBuy,
  overrideSale,
}: {
  latestRate: ICurrencyRate | null;
  pricingGroup: ICurrencyRateGroup | null;
  overrideBuy: ICurrencyRateMarginValue;
  overrideSale: ICurrencyRateMarginValue;
}): ICurrencyRateComparisonPreview | null => {
  if (!latestRate) {
    return null;
  }

  const baseBuyRate = getSideBaseRate(latestRate, 'buy');
  const baseSaleRate = getSideBaseRate(latestRate, 'sale');
  const buyGroupMarginAmount = calculateMarginAmount(
    baseBuyRate,
    pricingGroup?.buyMarginType,
    pricingGroup?.buyMarginValue,
  );
  const saleGroupMarginAmount = calculateMarginAmount(
    baseSaleRate,
    pricingGroup?.saleMarginType,
    pricingGroup?.saleMarginValue,
  );
  const buyGroupFinalRate = calculateFinalRate(
    baseBuyRate,
    pricingGroup?.buyMarginType,
    pricingGroup?.buyMarginValue,
    'subtract',
  );
  const saleGroupFinalRate = calculateFinalRate(
    baseSaleRate,
    pricingGroup?.saleMarginType,
    pricingGroup?.saleMarginValue,
    'add',
  );
  const buyOverrideMarginAmount = calculateMarginAmount(
    baseBuyRate,
    overrideBuy.marginType,
    overrideBuy.marginValue,
  );
  const saleOverrideMarginAmount = calculateMarginAmount(
    baseSaleRate,
    overrideSale.marginType,
    overrideSale.marginValue,
  );
  const buyOverrideFinalRate = calculateFinalRate(
    baseBuyRate,
    overrideBuy.marginType,
    overrideBuy.marginValue,
    'subtract',
  );
  const saleOverrideFinalRate = calculateFinalRate(
    baseSaleRate,
    overrideSale.marginType,
    overrideSale.marginValue,
    'add',
  );

  const buyApplied = resolveAppliedRate(
    buyGroupFinalRate,
    buyOverrideFinalRate,
    overrideBuy.marginType,
    overrideBuy.marginValue,
  );
  const saleApplied = resolveAppliedRate(
    saleGroupFinalRate,
    saleOverrideFinalRate,
    overrideSale.marginType,
    overrideSale.marginValue,
  );

  return {
    currencyCode: latestRate.currency?.currencyCode || latestRate.currencyId,
    currencyName: latestRate.currency?.currencyName || null,
    provider: latestRate.provider,
    pricingGroup,
    baseBuyRate,
    baseSaleRate,
    buy: {
      baseRate: baseBuyRate,
      groupMarginType: pricingGroup?.buyMarginType ?? null,
      groupMarginValue: pricingGroup?.buyMarginValue ?? null,
      groupMarginAmount: buyGroupMarginAmount,
      groupFinalRate: buyGroupFinalRate,
      overrideMarginType: overrideBuy.marginType,
      overrideMarginValue: overrideBuy.marginValue,
      overrideMarginAmount: buyOverrideMarginAmount,
      overrideFinalRate: buyOverrideFinalRate,
      appliedFinalRate: buyApplied.appliedFinalRate,
      appliedSource: buyApplied.appliedSource,
    },
    sale: {
      baseRate: baseSaleRate,
      groupMarginType: pricingGroup?.saleMarginType ?? null,
      groupMarginValue: pricingGroup?.saleMarginValue ?? null,
      groupMarginAmount: saleGroupMarginAmount,
      groupFinalRate: saleGroupFinalRate,
      overrideMarginType: overrideSale.marginType,
      overrideMarginValue: overrideSale.marginValue,
      overrideMarginAmount: saleOverrideMarginAmount,
      overrideFinalRate: saleOverrideFinalRate,
      appliedFinalRate: saleApplied.appliedFinalRate,
      appliedSource: saleApplied.appliedSource,
    },
  };
};

export const getRuleBaseRate = (
  rate: IProductCurrencyRate,
  side: CurrencyRateSide,
) => {
  const margin = side === 'buy' ? rate.buy : rate.sale;
  return {
    marginType: margin.marginType,
    marginValue: margin.marginValue,
    minRate: margin.minRate,
    maxRate: margin.maxRate,
  };
};
