import * as yup from 'yup';
import {
  TransactionPaymentMethodEnum,
  TransactionTypeEnum,
  TransactionTypeProfileEnum,
} from '@/modules/transactions';
import type { TransactionType } from '@/modules/transactions';
import type { PurchasePageType } from '@/pages/purchase/[slug]/purchasePage.enum';
import { TradeModeEnum } from '@/modules/transactions';
import {
  PassengerEntityTypeEnum,
  PassengerNationalityTypeEnum,
  PassengerPanHolderRelationTypeEnum,
  PassengerOtherIdProofTypeEnum,
  PassengerResidentStatusEnum,
} from '@/modules/passengers/types/passengerTypes';

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

const passengerOtherDocumentSchema = yup.object({
  documentType: yup
    .mixed<(typeof PassengerOtherIdProofTypeEnum)[keyof typeof PassengerOtherIdProofTypeEnum] | ''>()
    .oneOf([...Object.values(PassengerOtherIdProofTypeEnum), ''] as const)
    .required('Document type is required'),
  documentNumber: yup.string().trim().default(''),
  validTill: yup.string().trim().default(''),
  issueAt: yup.string().trim().default(''),
  issueDate: yup.string().trim().default(''),
  expiryDate: yup.string().trim().default(''),
  documentFile: yup.string().trim().default(''),
});

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
    purposeId: yup.string().trim().required('Purpose is required'),
    agentProfileId: yup.string().trim().default(''),
    agentProfileCode: yup.string().trim().default(''),
    agentProfileName: yup.string().trim().default(''),
    entityType: yup
      .mixed<(typeof PassengerEntityTypeEnum)[keyof typeof PassengerEntityTypeEnum] | ''>()
      .oneOf([...Object.values(PassengerEntityTypeEnum), ''] as const)
      .required('Passenger entity type is required'),
    passengerInfoCaptured: yup
      .boolean()
      .default(false)
      .oneOf([true], 'Passenger details are required'),
    nationalityType: yup
      .mixed<(typeof PassengerNationalityTypeEnum)[keyof typeof PassengerNationalityTypeEnum] | ''>()
      .oneOf([...Object.values(PassengerNationalityTypeEnum), ''] as const)
      .required('Nationality is required'),
    residentStatus: yup
      .mixed<(typeof PassengerResidentStatusEnum)[keyof typeof PassengerResidentStatusEnum] | ''>()
      .oneOf([...Object.values(PassengerResidentStatusEnum), ''] as const)
      .required('Resident status is required'),
    countryId: yup.string().trim().required('Country is required'),
    stateId: yup.string().trim().default(''),
    locationId: yup.string().trim().default(''),
    city: yup.string().trim().default(''),
    address1: yup.string().trim().default(''),
    address2: yup.string().trim().default(''),
    email: yup.string().trim().default(''),
    contactNo: yup.string().trim().default(''),
    panNumber: yup
      .string()
      .trim()
      .when(['entityType', 'nationalityType'], {
        is: (entityType: string, nationalityType: string) =>
          entityType === PassengerEntityTypeEnum.CORPORATE ||
          nationalityType === PassengerNationalityTypeEnum.INDIAN,
        then: schema => schema.required('PAN number is required'),
        otherwise: schema => schema.default(''),
      }),
    panHolderName: yup
      .string()
      .trim()
      .when(['entityType', 'nationalityType'], {
        is: (entityType: string, nationalityType: string) =>
          entityType === PassengerEntityTypeEnum.CORPORATE ||
          nationalityType === PassengerNationalityTypeEnum.INDIAN,
        then: schema => schema.required('PAN holder name is required'),
        otherwise: schema => schema.default(''),
      }),
    panDob: yup
      .string()
      .trim()
      .when(['entityType', 'nationalityType'], {
        is: (entityType: string, nationalityType: string) =>
          entityType === PassengerEntityTypeEnum.CORPORATE ||
          nationalityType === PassengerNationalityTypeEnum.INDIAN,
        then: schema => schema.required('PAN holder DOB is required'),
        otherwise: schema => schema.default(''),
      }),
    panHolderRelationType: yup
      .mixed<(typeof PassengerPanHolderRelationTypeEnum)[keyof typeof PassengerPanHolderRelationTypeEnum] | ''>()
      .oneOf([...Object.values(PassengerPanHolderRelationTypeEnum), ''] as const)
      .required('PAN holder relation is required'),
    corporatePanNumber: yup
      .string()
      .trim()
      .when('entityType', {
        is: PassengerEntityTypeEnum.CORPORATE,
        then: schema => schema.required('Corporate PAN number is required'),
        otherwise: schema => schema.default(''),
      }),
    corporatePanHolderName: yup
      .string()
      .trim()
      .when('entityType', {
        is: PassengerEntityTypeEnum.CORPORATE,
        then: schema => schema.required('Corporate PAN holder name is required'),
        otherwise: schema => schema.default(''),
      }),
    corporatePanDob: yup
      .string()
      .trim()
      .when('entityType', {
        is: PassengerEntityTypeEnum.CORPORATE,
        then: schema => schema.required('Corporate PAN holder DOB is required'),
        otherwise: schema => schema.default(''),
      }),
    corporatePanHolderRelationType: yup
      .mixed<(typeof PassengerPanHolderRelationTypeEnum)[keyof typeof PassengerPanHolderRelationTypeEnum] | ''>()
      .oneOf([...Object.values(PassengerPanHolderRelationTypeEnum), ''] as const)
      .when('entityType', {
        is: PassengerEntityTypeEnum.CORPORATE,
        then: schema => schema.required('Corporate PAN holder relation is required'),
        otherwise: schema => schema.default(''),
      }),
    paidByPanNumber: yup.string().trim().default(''),
    paidByPanHolderName: yup.string().trim().default(''),
    paidByPanDob: yup.string().trim().default(''),
    gstNumber: yup.string().trim().default(''),
    gstStateId: yup.string().trim().default(''),
    isPep: yup.boolean().default(false),
    passportNumber: yup
      .string()
      .trim()
      .when(['entityType', 'nationalityType'], {
        is: (_entityType: string, nationalityType: string) =>
          nationalityType !== PassengerNationalityTypeEnum.INDIAN,
        then: schema => schema.required('Passport number is required'),
        otherwise: schema => schema.default(''),
      }),
    passportIssueAt: yup
      .string()
      .trim()
      .when(['entityType', 'nationalityType'], {
        is: (_entityType: string, nationalityType: string) =>
          nationalityType !== PassengerNationalityTypeEnum.INDIAN,
        then: schema => schema.required('Passport issue place is required'),
        otherwise: schema => schema.default(''),
      }),
    passportIssueDate: yup
      .string()
      .trim()
      .when(['entityType', 'nationalityType'], {
        is: (_entityType: string, nationalityType: string) =>
          nationalityType !== PassengerNationalityTypeEnum.INDIAN,
        then: schema => schema.required('Passport issue date is required'),
        otherwise: schema => schema.default(''),
      }),
    passportExpiryDate: yup
      .string()
      .trim()
      .when(['entityType', 'nationalityType'], {
        is: (_entityType: string, nationalityType: string) =>
          nationalityType !== PassengerNationalityTypeEnum.INDIAN,
        then: schema => schema.required('Passport expiry date is required'),
        otherwise: schema => schema.default(''),
      }),
    arrivalDate: yup
      .string()
      .trim()
      .when(['entityType', 'nationalityType'], {
        is: (_entityType: string, nationalityType: string) =>
          nationalityType !== PassengerNationalityTypeEnum.INDIAN,
        then: schema => schema.required('Arrival date is required'),
        otherwise: schema => schema.default(''),
      }),
    otherDocuments: yup
      .array()
      .of(passengerOtherDocumentSchema)
      .default([])
      .when(['passengerInfoCaptured', 'nationalityType'], {
        is: (passengerInfoCaptured: boolean, nationalityType: string) =>
          passengerInfoCaptured &&
          nationalityType === PassengerNationalityTypeEnum.INDIAN,
        then: schema => schema.min(1, 'At least one other document is required'),
        otherwise: schema => schema.default([]),
      }),
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
