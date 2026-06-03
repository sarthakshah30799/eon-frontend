import {
  CurrencyCalculationMethod,
  CurrencyGroup,
  CurrencyProductAllowed,
  type ICreateCurrencyProfile,
  type ICurrencyProfile,
} from '../types';

export const createEmptyCurrencyProfileFormValues =
  (): ICreateCurrencyProfile => ({
    currencyCode: '',
    currencyName: '',
    countryId: '',
    priority: '',
    ratePer: '',
    defaultMinRate: '',
    defaultMaxRate: '',
    calculationMethod: CurrencyCalculationMethod.MULTIPLICATION,
    openRatePremium: '',
    gulfDiscFactor: '',
    amexMapCode: '',
    group: CurrencyGroup.ASIA,
    active: false,
    onlyStocking: false,
    productAllowed: '',
  });

export const mapRecordToFormValues = (
  record: ICurrencyProfile
): ICreateCurrencyProfile => ({
  currencyCode: record.currencyCode,
  currencyName: record.currencyName,
  countryId: record.countryId,
  priority: record.priority,
  ratePer: record.ratePer,
  defaultMinRate: record.defaultMinRate,
  defaultMaxRate: record.defaultMaxRate,
  calculationMethod: record.calculationMethod,
  openRatePremium: record.openRatePremium,
  gulfDiscFactor: record.gulfDiscFactor,
  amexMapCode: record.amexMapCode,
  group: record.group,
  active: record.active,
  onlyStocking: record.onlyStocking,
  productAllowed: record.productAllowed,
});

export const mapFormValuesToRecord = (
  values: ICreateCurrencyProfile,
  id: string,
  createdAt: string,
  updatedAt: string
): ICurrencyProfile => ({
  id,
  createdAt,
  updatedAt,
  ...values,
  productAllowed: values.onlyStocking
    ? (values.productAllowed || CurrencyProductAllowed.CN)
    : '',
});
