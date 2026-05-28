import * as yup from 'yup';

export const userRoleSchema = yup.object({
  code: yup.string().trim().required('Role code is required'),
  name: yup.string().trim().required('Role name is required'),
  description: yup.string().trim().default(''),
});
