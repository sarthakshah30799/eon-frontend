import * as yup from 'yup';

export const counterProfileSchema = yup.object({
  counterNo: yup
    .string()
    .trim()
    .required('Counter No. is required')
    .matches(/^\d+$/, 'Counter No. must be a valid number'),
  counterName: yup.string().trim().required('Counter Name is required').max(250, 'Counter Name must be at most 250 characters'),
  isActive: yup.boolean().default(true),
  isRetailCnt: yup.boolean().default(false),
  isBulkCnt: yup.boolean().default(false),
  isCombineCnt: yup.boolean().default(false),
});

