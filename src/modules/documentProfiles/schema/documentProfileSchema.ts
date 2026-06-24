import * as yup from 'yup';
import { DOCUMENT_TYPE_OPTIONS } from '../constants/documentProfileConstants';

export const documentProfileSchema = yup.object({
  documentCode: yup
    .string()
    .trim()
    .required('Document code is required'),
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
  specificationType: yup
    .string()
    .oneOf(['MASTER', 'TRANSACTION'], 'Select a valid specification type')
    .required('Specification type is required'),
  type: yup.string().uuid('Select a valid type').required('Type is required'),
  groupSelection: yup
    .string()
    .uuid('Select a valid document group')
    .required('Document Group is required'),
  entitySelection: yup.string().uuid('Select a valid entity type').required('Entity Type is required'),
  active: yup.boolean().default(true),
  sortOrder: yup.number().min(0).default(0),
});

export default documentProfileSchema;
