import * as yup from 'yup';

export const userRoleSchema = yup.object({
  roleCode: yup.string().trim().required('Role code is required'),
  roleName: yup.string().trim().required('Role name is required'),
  description: yup.string().trim().default(''),
});
