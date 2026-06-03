import * as yup from 'yup';

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const companyProfileSchema = yup.object({
  shortCode: yup
    .string()
    .trim()
    .max(20, 'Short Code must be at most 20 characters')
    .default(''),
  name: yup
    .string()
    .trim()
    .required('Name is required')
    .max(250, 'Name must be at most 250 characters'),
  formerlyKnownName: yup
    .string()
    .trim()
    .max(250, 'Name must be at most 250 characters')
    .default(''),
  cinNo: yup
    .string()
    .trim()
    .max(20, 'CIN No. must be at most 20 characters')
    .default(''),
  panNo: yup
    .string()
    .transform(value => value?.toUpperCase())
    .required('PAN Number is required')
    .matches(panRegex, 'Enter a valid PAN Number'),
  fxRegNo: yup
    .string()
    .trim()
    .max(20, 'FX Reg No. must be at most 20 characters')
    .default(''),
  fxRegDate: yup.string().trim().default(''),
  fromDate: yup.string().trim().default(''),
  toDate: yup.string().trim().default(''),
  logo: yup.string().trim().default(''),
  aeonLicNo: yup
    .string()
    .trim()
    .max(20, 'AEON Lic No. must be at most 20 characters')
    .default(''),
  website: yup.string().trim().default(''),
  email: yup.string().trim().email('Invalid email format').default(''),
});
