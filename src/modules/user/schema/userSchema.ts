import * as yup from 'yup';

export const userSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .default(''),
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format')
    .default(''),
});
