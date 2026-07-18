import * as yup from 'yup';
import {
  TransactionPaymentMethodEnum,
  TransactionTypeEnum,
  TransactionTypeProfileEnum,
} from '@/modules/transactions';
import type { TransactionType } from '@/modules/transactions';
import type { PurchasePageType } from '@/pages/purchase/[slug]/purchasePage.enum';
import { TradeModeEnum } from '@/modules/transactions';

const decimalStringSchema = yup
  .string()
  .trim()
  .test('decimal', 'Must be a valid decimal number', value => {
    if (!value) {
      return true;
    }

    return /^\d+(\.\d+)?$/.test(value);
  });

const quantityStringSchema = yup
  .string()
  .trim()
  .test('decimal', 'Must be a valid decimal number', value => {
    if (!value) {
      return true;
    }

    return /^\d+(\.\d{1,7})?$/.test(value);
  });

const signedDecimalStringSchema = yup
  .string()
  .trim()
  .test('decimal', 'Must be a valid decimal number', value => {
    if (!value) {
      return true;
    }

    return /^-?\d+(\.\d+)?$/.test(value);
  });

const purchaseTransactionSchema = yup.object({
  currencyId: yup.string().trim().required('Currency is required'),
  currencyCode: yup.string().trim().default(''),
  currencyName: yup.string().trim().default(''),
  productId: yup.string().trim().required('Product is required'),
  productCode: yup.string().trim().default(''),
  productDescription: yup.string().trim().default(''),
  quantity: quantityStringSchema.required('Quantity is required'),
  per: decimalStringSchema.default(''),
  rate: decimalStringSchema.default(''),
  commission: decimalStringSchema.default(''),
  commissionSnapshot: yup.mixed().nullable().default(null),
  total: decimalStringSchema.default(''),
  roundOff: signedDecimalStringSchema.default(''),
  finalAmount: decimalStringSchema.default(''),
});

const additionalChargeSchema = yup.object({
  accountId: yup.string().trim().default(''),
  accountName: yup.string().trim().default(''),
  amount: decimalStringSchema.default(''),
  gstRate: decimalStringSchema.default(''),
  gstAmount: decimalStringSchema.default(''),
  totalAmount: signedDecimalStringSchema.default(''),
});

const createPaymentDetailSchema = (transactionType: TransactionType) =>
  yup.object({
    paymentMethod: yup
      .mixed<(typeof TransactionPaymentMethodEnum)[keyof typeof TransactionPaymentMethodEnum]>()
      .oneOf([
        TransactionPaymentMethodEnum.CASH,
        TransactionPaymentMethodEnum.CHEQUE,
      ])
      .required('Payment mode is required'),
    accountId: yup.string().trim().required('Account is required'),
    accountName: yup.string().trim().default(''),
    chequePageId: yup.string().trim().when('paymentMethod', {
      is: TransactionPaymentMethodEnum.CHEQUE,
      then: schema =>
        transactionType === TransactionTypeEnum.PURCHASE
          ? schema.required('Cheque page is required')
          : schema.default(''),
      otherwise: schema => schema.default(''),
    }),
    chequePageSnapshot: yup.mixed().nullable().default(null),
    chequeNumber: yup.string().trim().when('paymentMethod', {
      is: TransactionPaymentMethodEnum.CHEQUE,
      then: schema => schema.required('Cheque / book reference is required'),
      otherwise: schema => schema.default(''),
    }),
    chequeDate: yup.string().trim().default(''),
    branchName: yup.string().trim().when('paymentMethod', {
      is: TransactionPaymentMethodEnum.CHEQUE,
      then: schema => schema.required('Branch name is required'),
      otherwise: schema => schema.default(''),
    }),
    drawnOn: yup.string().trim().default(''),
    amount: decimalStringSchema.required('Amount is required'),
    remarks: yup.string().trim().default(''),
  });

const manualBookReferenceTypeSchema = yup
  .mixed<'CASHIER' | 'DELIVERY_BOY'>()
  .oneOf(['CASHIER', 'DELIVERY_BOY'])
  .default('CASHIER');

export const createPurchaseFormSchema = (transactionType: TransactionType) =>
  yup.object({
    purchasePageType: yup
      .mixed<PurchasePageType>()
      .oneOf(Object.values(TransactionTypeProfileEnum))
      .nullable()
      .default(null),
    branchId: yup.string().trim().required('Branch is required'),
    branchSnapshot: yup.mixed().nullable().default(null),
    counterId: yup.string().trim().required('Counter is required'),
    transactionType: yup
      .mixed<(typeof TransactionTypeEnum)[keyof typeof TransactionTypeEnum]>()
      .oneOf(Object.values(TransactionTypeEnum))
      .default(transactionType),
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
    partyProfileStateName: yup.string().trim().default(''),
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
    cashierUserId: yup.string().trim().default(''),
    cashierUserCode: yup.string().trim().default(''),
    cashierUserName: yup.string().trim().default(''),
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
    paymentDetails: yup
      .array()
      .of(createPaymentDetailSchema(transactionType))
      .min(1, 'Add at least one payment detail')
      .required()
      .test('same-method', 'All payment rows must use the same method', rows => {
        const methods = (rows ?? [])
          .map(row => row?.paymentMethod?.trim?.() ?? '')
          .filter(Boolean);
        if (methods.length <= 1) {
          return true;
        }

        return new Set(methods).size === 1;
      }),
  });

export const purchaseFormSchema = createPurchaseFormSchema(TransactionTypeEnum.PURCHASE);
