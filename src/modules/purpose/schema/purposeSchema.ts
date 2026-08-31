import * as yup from 'yup';
import { PurposeRateTypeEnum } from '../types/purposeTypes';

const purposeSlabSchema = yup.object({
  id: yup.string().optional(),
  sortOrder: yup
    .number()
    .transform((value, originalValue) => (originalValue === '' ? 0 : value))
    .integer('Sort Order must be an integer')
    .min(1, 'Sort Order must be at least 1')
    .required('Sort Order is required'),
  fromAmount: yup
    .number()
    .transform((value, originalValue) => (originalValue === '' ? 0 : value))
    .min(0, 'From Amount must be at least 0')
    .required('From Amount is required'),
  toAmount: yup
    .number()
    .transform((value, originalValue) => {
      if (
        originalValue === '' ||
        originalValue === null ||
        originalValue === undefined
      ) {
        return null;
      }
      return value;
    })
    .nullable()
    .min(0, 'To Amount must be at least 0')
    .notRequired(),
  rate: yup
    .number()
    .transform((value, originalValue) => (originalValue === '' ? 0 : value))
    .min(0, 'Rate must be at least 0')
    .required('Rate is required'),
  rateType: yup
    .mixed<(typeof PurposeRateTypeEnum)[keyof typeof PurposeRateTypeEnum]>()
    .oneOf(Object.values(PurposeRateTypeEnum))
    .required('Rate type is required'),
});

export const purposeSchema = yup
  .object({
    code: yup
      .string()
      .trim()
      .length(2, 'Code must be exactly 2 characters')
      .required('Code is required'),
    description: yup.string().trim().required('Description is required'),
    threshold: yup
      .number()
      .transform((value, originalValue) => (originalValue === '' ? 0 : value))
      .min(0, 'Threshold must be at least 0')
      .default(0),
    rate: yup
      .number()
      .transform((value, originalValue) => (originalValue === '' ? 0 : value))
      .min(0, 'Rate must be at least 0')
      .default(0),
    rateType: yup
      .mixed<(typeof PurposeRateTypeEnum)[keyof typeof PurposeRateTypeEnum]>()
      .oneOf(Object.values(PurposeRateTypeEnum))
      .required('Rate type is required'),
    corporate: yup.boolean().default(true),
    individual: yup.boolean().default(false),
    sell: yup.boolean().default(false),
    purchase: yup.boolean().default(true),
    slabs: yup.array().of(purposeSlabSchema).default([]),
  })
  .test(
    'purpose-scope',
    'Purpose must apply to at least one party profile type and one transaction type',
    value =>
      Boolean(value?.corporate || value?.individual) &&
      Boolean(value?.sell || value?.purchase)
  );
