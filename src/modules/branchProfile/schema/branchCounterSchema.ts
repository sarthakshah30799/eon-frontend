import * as yup from 'yup';

export const branchCounterSchema = yup.object({
  counterNo: yup.string().trim().required('Counter No. is required'),
  name: yup.string().trim().required('Counter Name is required'),
  isActive: yup.boolean().required(),
});
