import * as yup from 'yup';

export const companyProfileSchema = yup.object({
  logo: yup.string().trim().default(''),
  name: yup.string().trim().required('Company name is required'),
  designation: yup.string().trim().default(''),
  rbiName: yup.string().trim().default(''),
  rbiPlace: yup.string().trim().default(''),
  address1: yup.string().trim().required('Address 1 is required'),
  address2: yup.string().trim().default(''),
  address3: yup.string().trim().default(''),
  pincode: yup
    .string()
    .trim()
    .required('Pincode is required')
    .matches(/^\d+$/, 'Pincode must contain only numbers')
    .min(6, 'Pincode must be 6 digits')
    .max(6, 'Pincode must be 6 digits'),
  city: yup.string().trim().required('City is required'),
  state: yup.string().trim().required('State is required'),
  country: yup.string().trim().default('India'),
});
