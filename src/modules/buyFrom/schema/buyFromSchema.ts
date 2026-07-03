import * as yup from 'yup';

const decimalStringSchema = yup
  .string()
  .trim()
  .test('decimal', 'Must be a valid decimal number', value => {
    if (!value) {
      return true;
    }

    return /^\d+(\.\d+)?$/.test(value);
  });

const buyFromTransactionSchema = yup.object({
  currencyId: yup.string().trim().required('Currency is required'),
  currencyCode: yup.string().trim().default(''),
  currencyName: yup.string().trim().default(''),
  productId: yup.string().trim().required('Product is required'),
  productCode: yup.string().trim().default(''),
  productDescription: yup.string().trim().default(''),
  quantity: decimalStringSchema.required('Quantity is required'),
  rate: decimalStringSchema.default(''),
  total: decimalStringSchema.default(''),
  roundOff: decimalStringSchema.default(''),
  finalAmount: decimalStringSchema.default(''),
});

const additionalChargeSchema = yup.object({
  accountId: yup.string().trim().default(''),
  accountName: yup.string().trim().default(''),
  amount: decimalStringSchema.default(''),
  gstRate: decimalStringSchema.default(''),
  gstAmount: decimalStringSchema.default(''),
  totalAmount: decimalStringSchema.default(''),
});

const paymentDetailSchema = yup.object({
  accountId: yup.string().trim().required('Account is required'),
  accountName: yup.string().trim().default(''),
  chequeNumber: yup.string().trim().required('Cheque / book reference is required'),
  chequeDate: yup.string().trim().required('Cheque date is required'),
  branchName: yup.string().trim().required('Branch name is required'),
  amount: decimalStringSchema.required('Amount is required'),
});

const manualBookReferenceTypeSchema = yup
  .mixed<'CASHIER' | 'DELIVERY_BOY'>()
  .oneOf(['CASHIER', 'DELIVERY_BOY'])
  .default('CASHIER');

export const buyFromFormSchema = yup.object({
  partyProfileId: yup.string().trim().required('Party profile is required'),
  partyProfileCode: yup.string().trim().default(''),
  partyProfileName: yup.string().trim().default(''),
  partyProfileApplyTax: yup.boolean().default(false),
  agentProfileId: yup.string().trim().default(''),
  agentProfileCode: yup.string().trim().default(''),
  agentProfileName: yup.string().trim().default(''),
  manualBookReferenceType: manualBookReferenceTypeSchema,
  manualBookId: yup.string().trim().required('Manual book reference is required'),
  manualBookNo: yup.string().trim().default(''),
  deliveryBoyUserId: yup.string().trim().when('manualBookReferenceType', {
    is: 'DELIVERY_BOY',
    then: schema => schema.required('Delivery boy is required'),
    otherwise: schema => schema.default(''),
  }),
  deliveryBoyUserCode: yup.string().trim().default(''),
  deliveryBoyUserName: yup.string().trim().default(''),
  number: yup.string().trim().default(''),
  transactions: yup
    .array()
    .of(buyFromTransactionSchema)
    .min(1, 'Add at least one transaction')
    .required(),
  additionalCharges: yup.array().of(additionalChargeSchema).default([]),
  paymentDetails: yup.array().of(paymentDetailSchema).default([]),
});
