import * as yup from 'yup';
import {
  DOCUMENT_PROFILE_SPECIFICATION_TYPE_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
} from '../constants/documentProfileConstants';

const ruleSchema = yup.object({
  documentCode: yup.string().trim().required('Document code is required'),
  documentDescription: yup
    .string()
    .trim()
    .required('Document description is required'),
  documentType: yup
    .array()
    .of(
      yup
        .string()
        .oneOf(
          DOCUMENT_TYPE_OPTIONS.map(option => option.value),
          'Select a valid document type'
        )
        .required('Document type is required')
    )
    .min(1, 'Select at least one document type')
    .required('Document type is required'),
  isRequired: yup.boolean().default(false),
  maxSizeMb: yup
    .number()
    .typeError('Max size must be a number')
    .positive('Max size must be greater than 0')
    .required('Max size is required'),
  active: yup.boolean().default(true),
  sortOrder: yup.number().min(0).default(0),
});

export const documentProfileSchema = yup.object({
  specificationType: yup
    .string()
    .oneOf(
      DOCUMENT_PROFILE_SPECIFICATION_TYPE_OPTIONS.map(option => option.value),
      'Select a valid specification type'
    )
    .required('Specification type is required'),
  type: yup
    .string()
    .oneOf(
      [yup.ref('specificationType')],
      'Select a valid type'
    )
    .required('Type is required'),
  groupSelection: yup
    .string()
    .trim()
    .required('Group is required'),
  entitySelection: yup
    .string()
    .trim()
    .required('Entity Type is required'),
  active: yup.boolean().default(true),
  sortOrder: yup.number().min(0).default(0),
  rules: yup
    .array()
    .of(ruleSchema)
    .min(1, 'At least one document rule is required')
    .required('Document rules are required'),
});
