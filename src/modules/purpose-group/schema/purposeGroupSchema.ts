import * as yup from 'yup';
import { PurposeGroupProfileTypeEnum } from '../types/purposeGroupTypes';

export const purposeGroupSchema = yup.object({
  name: yup.string().trim().required('Group name is required'),
  title: yup.string().trim().required('Report title is required'),
  profileType: yup
    .mixed<(typeof PurposeGroupProfileTypeEnum)[keyof typeof PurposeGroupProfileTypeEnum]>()
    .oneOf(Object.values(PurposeGroupProfileTypeEnum))
    .required('Profile type is required'),
  sortOrder: yup
    .number()
    .transform((value, originalValue) => (originalValue === '' ? 0 : value))
    .integer('Sort order must be an integer')
    .min(0, 'Sort order must be at least 0')
    .required('Sort order is required'),
  purposeIds: yup.array().of(yup.string().required()).default([]),
});
