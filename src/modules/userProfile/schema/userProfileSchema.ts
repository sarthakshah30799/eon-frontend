import * as yup from 'yup';

export const userProfileSchema = yup.object({
  corporateClientId: yup.string().trim().required('Corporate client is required'),
  code: yup.string().trim().required('Code is required'),
  name: yup.string().trim().required('Name is required'),
  cellNo: yup.string().trim().required('Cell number is required'),
  emailId: yup
    .string()
    .trim()
    .required('Email ID is required')
    .email('Enter a valid email address'),
  branchId: yup.string().trim().required('Branch is required'),
  idWillExpireOn: yup.string().trim().required('Expiry date is required'),
  groupId: yup.string().trim().required('Group is required'),
  purposeId: yup.string().trim().required('Purpose is required'),
  mpUsername: yup.string().trim().required('MP username is required'),
  controlSetup: yup.object({
    isActive: yup.boolean().default(false),
    isAdministrator: yup.boolean().default(false),
    miscLimitAuthorization: yup.boolean().default(false),
    canClearCounter: yup.boolean().default(false),
    complianceAuthorization: yup.boolean().default(false),
    dataEntryAuthorization: yup.boolean().default(false),
    creditLimitAuthorization: yup.boolean().default(false),
  }),
});

