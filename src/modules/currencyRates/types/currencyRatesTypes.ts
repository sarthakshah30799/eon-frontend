export const CurrencyRateProvider = {
  TICKER: 'TICKER',
  FOREX: 'FOREX',
} as const;

export type CurrencyRateProvider =
  (typeof CurrencyRateProvider)[keyof typeof CurrencyRateProvider];

export const CurrencyRateMarginType = {
  PERCENT: 'PERCENT',
  RATE: 'RATE',
} as const;

export type CurrencyRateMarginType =
  (typeof CurrencyRateMarginType)[keyof typeof CurrencyRateMarginType];

export const CurrencyRateMarginDirection = {
  ADD: 'ADD',
  SUBTRACT: 'SUBTRACT',
} as const;

export type CurrencyRateMarginDirection =
  (typeof CurrencyRateMarginDirection)[keyof typeof CurrencyRateMarginDirection];

export interface ICurrencyRateMargin {
  marginType: CurrencyRateMarginType;
  marginValue: string;
  marginDirection: CurrencyRateMarginDirection;
  minRate: string;
  maxRate: string;
}

export interface ICurrencyRateRule {
  buy: ICurrencyRateMargin;
  sale: ICurrencyRateMargin;
}

export interface ICurrencyRateSettings {
  defaultProvider: CurrencyRateProvider;
  roundingScale: number;
  global: ICurrencyRateRule;
  groups: Record<string, ICurrencyRateRule>;
  currencyOverrides: Record<string, ICurrencyRateRule>;
}

export interface ICurrencyRateGroup {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICurrencyRateCurrency {
  id: string;
  currencyCode: string;
  currencyName: string;
  countryId: string | null;
  pricingGroupId?: string | null;
}

export interface ICurrencyRateUser {
  id: string;
  code: string;
  name: string;
}

export interface ICurrencyRate {
  id: string;
  currencyId: string;
  provider: CurrencyRateProvider;
  currency?: ICurrencyRateCurrency | null;
  baseBuyRate: string;
  baseSaleRate: string;
  baseRate?: string | null;
  isActive: boolean;
  notes?: string | null;
  enteredBy?: string | null;
  enteredByUser?: ICurrencyRateUser | null;
  createdAt: string;
  updatedAt: string;
}

export interface ICurrencyRateQuoteSide {
  baseRate: string;
  marginAmount: string;
  finalRate: string;
  minRate: string;
  maxRate: string;
  isValid: boolean;
  reason?: string;
}

export interface ICurrencyRateQuote {
  currencyId: string;
  currencyCode: string;
  provider: CurrencyRateProvider;
  baseBuyRate: string;
  baseSaleRate: string;
  buy: ICurrencyRateQuoteSide;
  sale: ICurrencyRateQuoteSide;
  effectiveSource: 'currency-override' | 'group-default' | 'global-default';
}
