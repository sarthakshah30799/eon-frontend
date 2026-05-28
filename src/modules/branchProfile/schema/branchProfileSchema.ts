import * as yup from 'yup';

export const branchProfileSchema = yup.object({
  companyId: yup.string().uuid('Invalid company selection').required('Company selection is required'),
  branchCode: yup.string().trim().required('Branch code is required'),
  branchNumber: yup.number().typeError('Branch number must be a number').integer().required('Branch number is required'),
  address1: yup.string().trim().required('Address 1 is required'),
  address2: yup.string().trim().default(''),
  address3: yup.string().trim().default(''),
  pincode: yup.string().trim().required('Pincode is required'),
  city: yup.string().trim().required('City is required'),
  state: yup.string().trim().required('State is required'),
  country: yup.string().trim().default('India'),
  stateCode: yup.string().trim().length(2, 'State code must be exactly 2 characters').required('State code is required'),
  gstStateCode: yup.string().trim().required('GST State code is required'),
  countryCode1: yup.string().trim().default('IN'),
  phoneNumber1: yup.string().trim().required('Phone number 1 is required'),
  countryCode2: yup.string().trim().default('IN'),
  phoneNumber2: yup.string().trim().default(''),
  contactPersonName: yup.string().trim().default(''),
  contactPersonCountryCode: yup.string().trim().default('IN'),
  contactPersonPhone: yup.string().trim().default(''),
  operationGroup: yup.string().trim().default(''),
});
