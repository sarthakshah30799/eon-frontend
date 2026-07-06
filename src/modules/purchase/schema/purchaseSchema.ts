import * as yup from 'yup';
import {
  PurchasePageTypeEnum,
  type PurchasePageType,
} from '@/pages/purchase/[slug]/purchasePage.enum';
import { TradeModeEnum, TransactionTypeEnum } from '@/modules/transactions';

const decimalStringSchema = yup
  .string()
  .trim()
  .test('decimal', 'Must be a valid decimal number', value => {
    if (!value) {
      return true;
    }

    return /^\d+(\.\d+)?$/.test(value);
  });

const purchaseTransactionSchema = yup.object({
  currencyId: yup.string().trim().required('Currency is required'),
  currencyCode: yup.string().trim().default(''),
  currencyName: yup.string().trim().default(''),
  productId: yup.string().trim().required('Product is required'),
  productCode: yup.string().trim().default(''),
  productDescription: yup.string().trim().default(''),
  quantity: decimalStringSchema.required('Quantity is required'),
  rate: decimalStringSchema.default(''),
  commission: decimalStringSchema.default(''),
  commissionSnapshot: yup.mixed().nullable().default(null),
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
  chequePageId: yup.string().trim().required('Cheque page is required'),
  chequePageSnapshot: yup.mixed().nullable().default(null),
  chequeNumber: yup.string().trim().required('Cheque / book reference is required'),
  chequeDate: yup.string().trim().required('Cheque date is required'),
  branchName: yup.string().trim().required('Branch name is required'),
  amount: decimalStringSchema.required('Amount is required'),
});

const manualBookReferenceTypeSchema = yup
  .mixed<'CASHIER' | 'DELIVERY_BOY'>()
  .oneOf(['CASHIER', 'DELIVERY_BOY'])
  .default('CASHIER');

export const purchaseFormSchema = yup.object({
  purchasePageType: yup
    .mixed<PurchasePageType>()
    .oneOf(Object.values(PurchasePageTypeEnum))
    .nullable()
    .default(null),
  branchSnapshot: yup.mixed().nullable().default(null),
  transactionType: yup
    .mixed<(typeof TransactionTypeEnum)[keyof typeof TransactionTypeEnum]>()
    .oneOf(Object.values(TransactionTypeEnum))
    .default(TransactionTypeEnum.PURCHASE),
  tradeMode: yup
    .mixed<(typeof TradeModeEnum)[keyof typeof TradeModeEnum]>()
    .oneOf(Object.values(TradeModeEnum))
    .default(TradeModeEnum.BULK),
  partyProfileId: yup.string().trim().required('Party profile is required'),
  partyProfileCode: yup.string().trim().default(''),
  partyProfileName: yup.string().trim().default(''),
  partyProfileEmail: yup.string().trim().default(''),
  partyProfilePhoneNo: yup.string().trim().default(''),
  partyProfileAddress1: yup.string().trim().default(''),
  partyProfileAddress2: yup.string().trim().default(''),
  partyProfileAddress3: yup.string().trim().default(''),
  partyProfileCity: yup.string().trim().default(''),
  partyProfilePinCode: yup.string().trim().default(''),
  partyProfilePanNo: yup.string().trim().default(''),
  partyProfileGstNo: yup.string().trim().default(''),
  partyProfileGstStateName: yup.string().trim().default(''),
  partyProfileContactName: yup.string().trim().default(''),
  partyProfileApplyTax: yup.boolean().default(false),
  agentProfileId: yup.string().trim().default(''),
  agentProfileCode: yup.string().trim().default(''),
  agentProfileName: yup.string().trim().default(''),
  manualBookReferenceType: manualBookReferenceTypeSchema,
  manualBookId: yup.string().trim().required('Manual book reference is required'),
  manualBookNo: yup.string().trim().default(''),
  manualBookPageId: yup.string().trim().required('Manual book page is required'),
  manualBookPageSnapshot: yup.mixed().nullable().default(null),
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
    .of(purchaseTransactionSchema)
    .min(1, 'Add at least one transaction')
    .required(),
  additionalCharges: yup.array().of(additionalChargeSchema).default([]),
  paymentDetails: yup.array().of(paymentDetailSchema).default([]),
});
