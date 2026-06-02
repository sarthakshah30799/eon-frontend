import * as yup from 'yup';

export const branchProfileSchema = yup.object({
  branchCode: yup.string().trim().required('Branch Code is required').max(20, 'Branch Code must be at most 20 characters'),
  branchNumber: yup
    .string()
    .trim()
    .required('Branch Number is required')
    .matches(/^\d+$/, 'Branch Number must contain only numbers'),
  address1: yup.string().trim().required('Address 1 is required').max(250, 'Address must be at most 250 characters'),
  address2: yup.string().trim().max(250, 'Address must be at most 250 characters').default(''),
  address3: yup.string().trim().max(250, 'Address must be at most 250 characters').default(''),
  city: yup.string().trim().required('City is required').max(250, 'City must be at most 250 characters'),
  state: yup.string().trim().required('State is required').max(250, 'State must be at most 250 characters'),
  gstState: yup.string().trim().max(250, 'GST State must be at most 250 characters').default(''),
  pinCode: yup
    .string()
    .trim()
    .required('Pincode is required')
    .matches(/^\d+$/, 'Pincode must contain only numbers')
    .min(6, 'Pincode must be 6 digits')
    .max(6, 'Pincode must be 6 digits'),
  gstNo: yup.string().trim().max(20, 'GST No. must be at most 20 characters').default(''),
  fxRegNo: yup.string().trim().max(20, 'FX Reg No. must be at most 20 characters').default(''),
  fxRegDate: yup.string().trim().default(''),
  contactName: yup.string().trim().max(250, 'Contact Name must be at most 250 characters').default(''),
  contactNo: yup.string().trim().default(''),
  branchEmailId: yup.string().trim().email('Invalid email format').default(''),
  aeonBranchLic: yup.string().trim().max(20, 'AEON Branch Lic must be at most 20 characters').default(''),
  locationType: yup.string().trim().max(250, 'Location Type must be at most 250 characters').default(''),
  cashHolding: yup.string().trim().default('0'),
  cashHoldingTemp: yup.string().trim().default('0'),
  currHolding: yup.string().trim().default('0'),
  currHoldingTemp: yup.string().trim().default('0'),
  isHeadOffice: yup.boolean().default(false),
  isActive: yup.boolean().default(true),
  connectCounterIds: yup.array().of(yup.string()).default([]),
});

