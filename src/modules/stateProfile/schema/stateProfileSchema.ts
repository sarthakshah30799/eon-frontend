import * as yup from 'yup';

export const stateProfileSchema = yup.object({
  stateCode: yup.string().trim().required('State Code is required'),
  stateName: yup.string().trim().required('State Name is required'),
  gstStateCode: yup.string().trim().required('GST State Code is required'),
  ctrStateCode: yup.string().trim().required('CTR State Code is required'),
});

