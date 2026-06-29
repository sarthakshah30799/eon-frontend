import * as yup from 'yup';
import {
  CurrencyCalculationMethod,
  CurrencyGroup,
  CurrencyProductAllowed,
} from '../types';

const numericString = (label: string) =>
  yup
    .string()
    .trim()
    .matches(/^\d+(\.\d+)?$/, `${label} must be a valid decimal number`)
    .required(`${label} is required`);

export const currencyProfileSchema = yup.object({
  currencyCode: yup.string().trim().required('Currency Code is required'),
  currencyName: yup.string().trim().required('Currency Name is required'),
  countryId: yup.string().trim().required('Countries is required'),
  priority: numericString('Priority'),
  ratePer: numericString('Rate / Per'),
  defaultMinRate: numericString('Default Min Rate'),
  defaultMaxRate: numericString('Default Max Rate'),
  calculationMethod: yup
    .string()
    .trim()
    .oneOf(Object.values(CurrencyCalculationMethod))
    .required('Calculation Method is required'),
  openRatePremium: numericString('Open Rate Premium'),
  gulfDiscFactor: numericString('Gulf Disc Factor'),
  amexMapCode: yup.string().trim().required('Amex Map Code is required'),
  group: yup
    .string()
    .trim()
    .oneOf(Object.values(CurrencyGroup))
    .required('Group is required'),
  pricingGroupId: yup.string().uuid().default('').defined(),
  active: yup.boolean().default(false),
  onlyStocking: yup.boolean().default(false),
  productAllowed: yup
    .string()
    .trim()
    .oneOf([...Object.values(CurrencyProductAllowed), ''])
    .default('')
    .defined()
    .when('onlyStocking', {
      is: true,
      then: schema =>
        schema.oneOf(Object.values(CurrencyProductAllowed)).required(
          'Product Allowed is required'
        ),
      otherwise: schema => schema.default('').defined(),
    }),
});
