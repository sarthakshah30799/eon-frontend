import * as yup from 'yup';

export const userProfileSchema = yup.object({
  userCode: yup.string().trim().required('User code is required'),
  password: yup.string().trim().min(6, 'Password must be at least 6 characters').optional(),
  firstName: yup.string().trim().required('First name is required'),
  lastName: yup.string().trim().required('Last name is required'),
  email: yup.string().trim().email('Enter a valid email address').required('Email is required'),
  countryCode: yup.string().trim().default('IN'),
  phoneNumber: yup.string().trim().required('Phone number is required'),
  status: yup.string().oneOf(['pending', 'active', 'inactive']).default('active'),
  isHo: yup.boolean().default(false),
});
