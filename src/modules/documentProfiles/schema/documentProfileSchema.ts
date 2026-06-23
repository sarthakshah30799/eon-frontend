import * as yup from 'yup';
import { DOCUMENT_TYPE_OPTIONS } from '../constants/documentProfileConstants';

const ruleSchema = yup.object({
  documentCode: yup.string().trim().required('Document code is required'),
  documentDescription: yup
    .string()
    .trim()
    .required('Document description is required'),
  documentType: yup
    .string()
    .oneOf(
      DOCUMENT_TYPE_OPTIONS.map(option => option.value),
      'Select a valid document type'
    )
    .required('Document type is required'),
  isRequired: yup.boolean().default(false),
  maxSizeMb: yup
    .number()
    .typeError('Max size must be a number')
    .positive('Max size must be greater than 0')
    .required('Max size is required'),
  profileSelection: yup.string().nullable().default(''),
  entitySelection: yup.string().nullable().default(''),
  fieldSelection: yup.string().nullable().default(''),
  fieldValue: yup.string().nullable().default(''),
  active: yup.boolean().default(true),
  sortOrder: yup.number().min(0).default(0),
});

export const documentProfileSchema = yup.object({
  profileCode: yup.string().trim().required('Profile code is required'),
  profileName: yup.string().trim().required('Profile name is required'),
  profileDescription: yup.string().nullable().default(''),
  active: yup.boolean().default(true),
  sortOrder: yup.number().min(0).default(0),
  rules: yup
    .array()
    .of(ruleSchema)
    .min(1, 'At least one document rule is required')
    .required('Document rules are required'),
});

