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

export interface ICurrencyRateSettings {
  defaultProvider: CurrencyRateProvider;
  buyMarginType: CurrencyRateMarginType;
  buyMarginValue: string;
  buyMinRate: string;
  buyMaxRate: string;
  saleMarginType: CurrencyRateMarginType;
  saleMarginValue: string;
  saleMinRate: string;
  saleMaxRate: string;
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
  effectiveSource: 'advanced-settings' | 'currency-override' | 'group-default' | 'global-default';
}
