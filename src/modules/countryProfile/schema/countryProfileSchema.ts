import * as yup from 'yup';
import { CountryRiskCategory } from '@/modules/countryProfile/types';

export const countryProfileSchema = yup.object({
  code: yup.string().trim().required('Country Code is required'),
  name: yup.string().trim().required('Country Name is required'),
  lrsCountryCode: yup.string().trim().default(''),
  ctrCountryCode: yup.string().trim().default(''),
  riskCategory: yup
    .string()
    .trim()
    .oneOf(Object.values(CountryRiskCategory))
    .default(CountryRiskCategory.LOW),
  restrictedCountry: yup.boolean().default(false),
  greyListCountry: yup.boolean().default(false),
  baseCountry: yup.boolean().default(false),
});
