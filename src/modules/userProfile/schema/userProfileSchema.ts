import * as yup from 'yup';

export const userProfileSchema = yup.object({
  code: yup.string().trim().required('User Code is required').max(20, 'User Code must be at most 20 characters'),
  name: yup.string().trim().required('User Name is required').max(250, 'User Name must be at most 250 characters'),

  contactNo: yup.string().trim(),
  email: yup
    .string()
    .trim()
    .required('Email ID is required')
    .email('Enter a valid email address'),
  employeeNo: yup.string().trim(),
  designation: yup.string().trim(),
  userLicNo: yup.string().trim(),
  isActive: yup.boolean().default(true),
  isLocked: yup.boolean().default(false),
  isDormant: yup.boolean().default(false),
  password: yup.string().trim().when('$isEdit', {
    is: true,
    then: (schema) => schema.notRequired(),
    otherwise: (schema) => schema.required('Password is required').min(6, 'Password must be at least 6 characters'),
  }),
  roleId: yup.string().trim().nullable(),
  branchId: yup.string().trim().nullable(),
  counterId: yup.string().trim().nullable(),
});
