import * as yup from 'yup';
import type { IPasswordPolicy } from '../types/authTypes';

export const DEFAULT_PASSWORD_POLICY: IPasswordPolicy = {
  minLength: 6,
  maxLength: 128,
  minSpecialCharCount: 0,
  minNumericCount: 0,
  minAlphaCount: 0,
  maxInvalidAttempts: 0,
};

const countMatches = (value: string, pattern: RegExp) => {
  return value.match(pattern)?.length ?? 0;
};

const buildPasswordSchema = (policy: IPasswordPolicy = DEFAULT_PASSWORD_POLICY) =>
  yup
    .string()
    .required('Password is required')
    .min(policy.minLength, `Password must be at least ${policy.minLength} characters`)
    .max(policy.maxLength, `Password must be at most ${policy.maxLength} characters`)
    .test('min-special-characters', `Password must contain at least ${policy.minSpecialCharCount} special character(s)`, value => {
      if (!value || policy.minSpecialCharCount <= 0) {
        return true;
      }
      return countMatches(value, /[^A-Za-z0-9]/g) >= policy.minSpecialCharCount;
    })
    .test('min-numeric-characters', `Password must contain at least ${policy.minNumericCount} numeric character(s)`, value => {
      if (!value || policy.minNumericCount <= 0) {
        return true;
      }
      return countMatches(value, /[0-9]/g) >= policy.minNumericCount;
    })
    .test('min-alpha-characters', `Password must contain at least ${policy.minAlphaCount} alphabetic character(s)`, value => {
      if (!value || policy.minAlphaCount <= 0) {
        return true;
      }
      return countMatches(value, /[A-Za-z]/g) >= policy.minAlphaCount;
    });

export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required'),
});

export const buildLoginSchema = () => loginSchema;

export interface ILoginFormData {
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

export const buildResetPasswordSchema = (
  policy: IPasswordPolicy = DEFAULT_PASSWORD_POLICY
) =>
  yup.object({
    password: buildPasswordSchema(policy),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
  });

export const resetPasswordSchema = buildResetPasswordSchema();
