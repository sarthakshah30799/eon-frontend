import * as yup from 'yup';

export const companyProfileSchema = yup.object({
  companyName: yup.string().trim().required('Company name is required'),
  rbiName: yup.string().trim().required('RBI name is required'),
  rbiDesignation: yup.string().trim().required('RBI designation is required'),
  rbiPlace: yup.string().trim().required('RBI place is required'),
  rbiAddress1: yup.string().trim().required('RBI address 1 is required'),
  rbiAddress2: yup.string().trim().default(''),
  rbiAddress3: yup.string().trim().default(''),
});
