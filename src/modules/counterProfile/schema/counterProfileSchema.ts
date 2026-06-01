import * as yup from 'yup';

export const counterProfileSchema = yup.object({
  counterCode: yup.string().trim().required('Counter Code is required'),
  counterName: yup.string().trim().required('Counter Name is required'),
  isActive: yup.boolean().required(),
});
