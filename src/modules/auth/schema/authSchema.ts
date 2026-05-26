import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export interface LoginFormData {
  email: string;
  password: string;
}

export const otpMobileSchema = yup.object({
  countryCode: yup.string().required('Country code is required'),
  mobileNumber: yup
    .string()
    .matches(/^\d{7,15}$/, 'Please enter a valid mobile number')
    .required('Mobile number is required'),
});

export const otpSchema = yup.object({
  otp: yup
    .string()
    .matches(/^\d+$/, 'OTP must contain only numbers')
    .length(6, 'OTP must be exactly 6 digits')
    .required('OTP is required'),
});

export const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});
