import * as yup from 'yup';

export const stateProfileSchema = yup.object({
  countryId: yup.string().trim().required('Country is required'),
  code: yup.string().trim().required('State Code is required'),
  name: yup.string().trim().required('State Name is required'),
  gstStateCode: yup.string().trim().default(''),
  ctrStateCode: yup.string().trim().default(''),
});
