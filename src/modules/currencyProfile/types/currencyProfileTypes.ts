export const CurrencyCalculationMethod = {
  MULTIPLICATION: 'MULTIPLICATION',
  DIVISION: 'DIVISION',
} as const;

export type CurrencyCalculationMethod =
  (typeof CurrencyCalculationMethod)[keyof typeof CurrencyCalculationMethod];

export const CurrencyGroup = {
  ASIA: 'ASIA',
  AFRICA: 'AFRICA',
  EUROPE: 'EUROPE',
  GULF: 'GULF',
} as const;

export type CurrencyGroup =
  (typeof CurrencyGroup)[keyof typeof CurrencyGroup];

export const CurrencyProductAllowed = {
  CN: 'CN',
  CM: 'CM',
  CC: 'CC',
  ET: 'ET',
  TC: 'TC',
  TM: 'TM',
} as const;

export type CurrencyProductAllowed =
  (typeof CurrencyProductAllowed)[keyof typeof CurrencyProductAllowed];

export interface ICurrencyProfile {
  id: string;
  currencyCode: string;
  currencyName: string;
  countryId: string;
  country?: {
    id: string;
    name: string;
    code?: string;
  } | null;
  priority: string;
  ratePer: string;
  defaultMinRate: string;
  defaultMaxRate: string;
  calculationMethod: CurrencyCalculationMethod;
  openRatePremium: string;
  gulfDiscFactor: string;
  amexMapCode: string;
  group: CurrencyGroup;
  pricingGroupId?: string | null;
  pricingGroup?: {
    id: string;
    code: string;
    name: string;
    description?: string | null;
    buyMarginType?: string | null;
    buyMarginValue?: string | null;
    saleMarginType?: string | null;
    saleMarginValue?: string | null;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
  } | null;
  active: boolean;
  onlyStocking: boolean;
  productAllowed: CurrencyProductAllowed | '';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export type ICreateCurrencyProfile = Omit<
  ICurrencyProfile,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'pricingGroup'
> & {
  pricingGroupId: string;
};

export type IUpdateCurrencyProfile = Partial<ICreateCurrencyProfile>;
