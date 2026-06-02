import type {
  CountryProfileFormValues,
  CountryProfileRecord,
} from '../types';

export const createEmptyCountryProfileFormValues =
  (): CountryProfileFormValues => ({
    countryCode: '',
    countryName: '',
    lrsCountryCode: '',
    ctrCountryCode: '',
    riskCategory: '',
    restrictedCountry: false,
    greyListCountry: false,
    baseCountry: false,
  });

export const mapRecordToFormValues = (
  record: CountryProfileRecord
): CountryProfileFormValues => ({
  countryCode: record.countryCode ?? '',
  countryName: record.countryName ?? '',
  lrsCountryCode: record.lrsCountryCode ?? '',
  ctrCountryCode: record.ctrCountryCode ?? '',
  riskCategory: record.riskCategory ?? '',
  restrictedCountry: record.restrictedCountry ?? false,
  greyListCountry: record.greyListCountry ?? false,
  baseCountry: record.baseCountry ?? false,
});

export const mapFormValuesToRecord = (
  values: CountryProfileFormValues,
  id: string,
  createdAt: string,
  updatedAt: string
): CountryProfileRecord => ({
  id,
  createdAt,
  updatedAt,
  ...values,
});
