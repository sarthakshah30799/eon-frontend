import * as yup from 'yup';
import { TransactionTypeEnum } from '@/modules/transactions';
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
      if (originalValue === '' || originalValue === null || originalValue === undefined) {
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

export const purposeSchema = yup.object({
  code: yup.string().trim().length(2, 'Code must be exactly 2 characters').required('Code is required'),
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
  transactionType: yup
    .mixed<(typeof TransactionTypeEnum)[keyof typeof TransactionTypeEnum]>()
    .oneOf(Object.values(TransactionTypeEnum))
    .required('Transaction type is required'),
  slabs: yup.array().of(purposeSlabSchema).default([]),
});
