import * as yup from 'yup';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';

const categoryOptionCodeValues = Object.values(CategoryOptionCodeEnum);

export const categoryOptionsSchema = yup.object({
  code: yup
    .mixed<(typeof categoryOptionCodeValues)[number]>()
    .oneOf(categoryOptionCodeValues)
    .required('Category code is required'),
  value: yup
    .string()
    .trim()
    .required('Value is required')
    .max(250, 'Value must be at most 250 characters'),
  label: yup
    .string()
    .trim()
    .required('Label is required')
    .max(250, 'Label must be at most 250 characters'),
  sortOrder: yup
    .number()
    .typeError('Sort order must be a number')
    .integer('Sort order must be an integer')
    .min(0, 'Sort order must be zero or greater')
    .default(0),
  isActive: yup.boolean().default(true),
});
