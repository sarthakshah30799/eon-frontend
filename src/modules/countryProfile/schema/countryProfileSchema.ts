import * as yup from 'yup';

export const countryProfileSchema = yup.object({
  countryCode: yup.string().trim().required('Country Code is required'),
  countryName: yup.string().trim().required('Country Name is required'),
  lrsCountryCode: yup.string().trim().required('LRS Country Code is required'),
  ctrCountryCode: yup.string().trim().required('CTR Country Code is required'),
  riskCategory: yup.string().trim().required('Risk Category is required'),
  restrictedCountry: yup.boolean().required(),
  greyListCountry: yup.boolean().required(),
  baseCountry: yup.boolean().required(),
});
