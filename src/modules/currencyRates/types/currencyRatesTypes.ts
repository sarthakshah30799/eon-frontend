export const CurrencyRateProvider = {
  TICKER: 'TICKER',
  FOREX: 'FOREX',
  MANUAL: 'MANUAL',
} as const;

export type CurrencyRateProvider =
  (typeof CurrencyRateProvider)[keyof typeof CurrencyRateProvider];

export const CurrencyRateMarginType = {
  PERCENT: 'PERCENT',
  RATE: 'RATE',
} as const;

export type CurrencyRateMarginType =
  (typeof CurrencyRateMarginType)[keyof typeof CurrencyRateMarginType];

export interface ICurrencyRateMargin {
  marginType: CurrencyRateMarginType | '';
  marginValue: string | null;
  minRate: string | null;
  maxRate: string | null;
}

export interface ICurrencyRateGroupFormValues {
  id: string;
  code: string;
  name: string;
  description: string;
  buyMarginType: CurrencyRateMarginType | '';
  buyMarginValue: string;
  saleMarginType: CurrencyRateMarginType | '';
  saleMarginValue: string;
  isActive: boolean;
}

export interface ICurrencyRateEntryFormValues {
  currencyId: string;
  provider: CurrencyRateProvider | '';
  baseBuyRate: string;
  baseSaleRate: string;
  baseRate: string;
  notes: string;
}

export interface IProductCurrencyRateFormValues {
  id: string;
  productId: string;
  currencyId: string;
  buy: ICurrencyRateMargin;
  sale: ICurrencyRateMargin;
  isActive: boolean;
}

export interface ICurrencyRateRule {
  buy: ICurrencyRateMargin;
  sale: ICurrencyRateMargin;
}

export interface ICurrencyRateGroup {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  buyMarginType: CurrencyRateMarginType | null;
  buyMarginValue: string | null;
  saleMarginType: CurrencyRateMarginType | null;
  saleMarginValue: string | null;
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

export interface IProductCurrencyRate {
  id: string;
  productId: string;
  currencyId: string;
  buy: ICurrencyRateMargin;
  sale: ICurrencyRateMargin;
  isActive: boolean;
  product?: { id: string; productCode: string; productDescription: string } | null;
  currency?: { id: string; currencyCode: string; currencyName: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ICurrencyRateQuote {
  productId: string;
  productCode: string;
  currencyId: string;
  currencyCode: string;
  provider: CurrencyRateProvider;
  baseBuyRate: string;
  baseSaleRate: string;
  buy: ICurrencyRateQuoteSide;
  sale: ICurrencyRateQuoteSide;
  effectiveSource: 'product-override' | 'group-default';
  effectiveGroupCode: string | null;
}

export interface ICurrencyRateComparisonSide {
  baseRate: string | null;
  groupMarginType: CurrencyRateMarginType | null;
  groupMarginValue: string | null;
  groupMarginAmount: string | null;
  groupFinalRate: string | null;
  overrideMarginType: CurrencyRateMarginType | '';
  overrideMarginValue: string | null;
  overrideMarginAmount: string | null;
  overrideFinalRate: string | null;
  appliedFinalRate: string | null;
  appliedSource: 'group' | 'override' | 'none';
}

export interface ICurrencyRateComparisonPreview {
  currencyCode: string;
  currencyName: string | null;
  provider: CurrencyRateProvider;
  pricingGroup: ICurrencyRateGroup | null;
  baseBuyRate: string | null;
  baseSaleRate: string | null;
  buy: ICurrencyRateComparisonSide;
  sale: ICurrencyRateComparisonSide;
}

export interface ICurrencyRateGroupUpsertPayload {
  code: string;
  name: string;
  description?: string;
  buyMarginType: CurrencyRateMarginType | null;
  buyMarginValue: string | null;
  saleMarginType: CurrencyRateMarginType | null;
  saleMarginValue: string | null;
  isActive: boolean;
}

export interface ICurrencyRateEntryUpsertPayload {
  currencyId: string;
  provider: CurrencyRateProvider | '';
  baseRate?: string;
  baseBuyRate?: string;
  baseSaleRate?: string;
  isActive?: boolean;
  notes?: string;
}

export interface IProductCurrencyRateUpsertPayload {
  productId: string;
  currencyId: string;
  buy: ICurrencyRateMargin;
  sale: ICurrencyRateMargin;
  isActive?: boolean;
}
