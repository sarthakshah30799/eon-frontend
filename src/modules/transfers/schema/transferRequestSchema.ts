import * as yup from 'yup';

const transferItemSchema = yup.object({
  currencyId: yup.string().trim().required('Currency is required'),
  currencyCode: yup.string().trim().optional().default(''),
  currencyName: yup.string().trim().optional().default(''),
  productId: yup.string().trim().required('Product is required'),
  productCode: yup.string().trim().optional().default(''),
  productDescription: yup.string().trim().optional().default(''),
  quantity: yup
    .string()
    .trim()
    .required('Quantity is required')
    .test('transfer-item-quantity', 'Quantity must be a valid number', value => {
      if (!value) return false;
      return Number.isFinite(Number(value));
    }),
  per: yup
    .string()
    .trim()
    .required('Per is required')
    .test('transfer-item-per', 'Per must be a valid number', value => {
      if (!value) return false;
      return Number.isFinite(Number(value));
    }),
  rate: yup
    .string()
    .trim()
    .required('Rate is required')
    .test('transfer-item-rate', 'Rate must be a valid number', value => {
      if (!value) return false;
      return Number.isFinite(Number(value));
    }),
  rateEditable: yup.boolean().default(false),
  total: yup.string().trim().optional().nullable(),
  roundOff: yup.string().trim().optional().nullable(),
  finalAmount: yup.string().trim().optional().nullable(),
  commission: yup.string().trim().optional().nullable(),
  commissionSnapshot: yup.mixed().optional().nullable(),
});

export const transferRequestSchema = yup.object({
  transferType: yup
    .mixed<'COUNTER' | 'BRANCH'>()
    .oneOf(['COUNTER', 'BRANCH'])
    .required('Transfer type is required'),
  number: yup.string().trim().default(''),
  transactionDate: yup.string().trim().optional().nullable(),
  billReference: yup.string().trim().required('Bill reference is required'),
  sourceBranchId: yup.string().trim().required('Source branch is required'),
  sourceCounterId: yup.string().trim().required('Source counter is required'),
  destinationBranchId: yup.string().trim().required('Destination branch is required'),
  destinationCounterId: yup.string().trim().required('Destination counter is required'),
  rejectionReason: yup.string().trim().optional().default(''),
  items: yup
    .array()
    .of(transferItemSchema)
    .min(1, 'At least one transfer item is required')
    .required('Transfer items are required'),
});

export default transferRequestSchema;
