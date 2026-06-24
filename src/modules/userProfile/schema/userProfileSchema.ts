import * as yup from 'yup';

const userProfileAssignmentSchema = yup.object({
  roleId: yup.string().trim().required('User Role is required'),
  roleLabel: yup.string().trim().default(''),
  branchId: yup.string().trim().required('Branch is required'),
  branchLabel: yup.string().trim().default(''),
  counterId: yup.string().trim().required('Counter is required'),
  counterLabel: yup.string().trim().default(''),
});

export const userProfileSchema = yup.object({
  code: yup
    .string()
    .trim()
    .required('User Code is required')
    .max(20, 'User Code must be at most 20 characters'),
  name: yup
    .string()
    .trim()
    .required('User Name is required')
    .max(250, 'User Name must be at most 250 characters'),
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
  roleId: yup.string().trim().nullable().notRequired(),
  roleName: yup.string().trim().nullable().notRequired(),
  branchId: yup.string().trim().nullable().notRequired(),
  branchName: yup.string().trim().nullable().notRequired(),
  counterId: yup.string().trim().nullable().notRequired(),
  counterName: yup.string().trim().nullable().notRequired(),
  assignments: yup
    .array()
    .of(userProfileAssignmentSchema)
    .min(1, 'At least one assignment is required')
    .required('At least one assignment is required')
    .default([]),
});
