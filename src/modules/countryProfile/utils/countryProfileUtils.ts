import { CountryRiskCategory } from '@/modules/countryProfile/types';
import type { ICreateCountryProfile } from '../types';

export const createEmptyCountryProfileFormValues =
  (): ICreateCountryProfile => ({
    code: '',
    name: '',
    lrsCountryCode: '',
    ctrCountryCode: '',
    riskCategory: CountryRiskCategory.LOW,
    restrictedCountry: false,
    greyListCountry: false,
    baseCountry: false,
  });
