import * as yup from 'yup';
import {
  TransactionPaymentMethodEnum,
  TransactionTypeEnum,
  TransactionTypeProfileEnum,
  TransactionPartyProfileTypeEnum,
} from '@/modules/transactions';
import type { TransactionType } from '@/modules/transactions';
import {
  isCorporateIndividualPurchasePage,
  type PurchasePageType,
} from '@/pages/purchase/[slug]/purchasePage.enum';
import { TradeModeEnum } from '@/modules/transactions';
import { PurposeRateTypeEnum } from '@/modules/purpose/types/purposeTypes';
import {
  PassengerEntityTypeEnum,
  PassengerNationalityTypeEnum,
  PassengerOtherIdProofTypeEnum,
  PassengerResidentStatusEnum,
} from '@/modules/passengers/types/passengerTypes';
import {
  isPassengerOtherDocumentFilled,
  shouldShowPassengerOtherDocumentValidityFields,
} from '@/modules/passengers/utils/passengerOtherDocumentRules';
import {
  getPassengerPanNumberError,
  isPassengerPanHolderRelationRequired,
  isPassengerPanRequired,
  isPassengerPassportRequired,
  isPassengerArrivalDateRequired,
} from '@/modules/passengers/utils/passengerIdentityRules';
import { PASSENGER_IDENTITY_TEXT } from '@/modules/passengers/constants/passengerConstants';
import {
  isCardProductCode,
  PURCHASE_TRANSACTION_TEXT,
  shouldValidatePaymentDetailRow,
} from '../utils/purchaseUtils';

const requiresCorporateIndividualPassenger = (
  purchasePageType: PurchasePageType | null | undefined
) => isCorporateIndividualPurchasePage(purchasePageType);

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

const createPurchaseTransactionSchema = (transactionType: TransactionType) =>
  yup.object({
    currencyId: yup.string().trim().required('Currency is required'),
    currencyCode: yup.string().trim().default(''),
    currencyName: yup.string().trim().default(''),
    productId: yup.string().trim().required('Product is required'),
    productCode: yup.string().trim().default(''),
    productDescription: yup.string().trim().default(''),
    quantity: quantityStringSchema.test(
      'card-sale-fe-amount',
      PURCHASE_TRANSACTION_TEXT.quantityRequired,
      function (value) {
        const isCardSale =
          transactionType === TransactionTypeEnum.SALE &&
          isCardProductCode(this.parent.productCode);
        if (!String(value ?? '').trim()) {
          return this.createError({
            message: isCardSale
              ? PURCHASE_TRANSACTION_TEXT.feAmountRequired
              : PURCHASE_TRANSACTION_TEXT.quantityRequired,
          });
        }

        if (isCardSale) {
          const amount = Number(value);
          if (!Number.isFinite(amount) || amount <= 0) {
            return this.createError({
              message: PURCHASE_TRANSACTION_TEXT.feAmountPositive,
            });
          }
        }

        return true;
      }
    ),
    per: decimalStringSchema.default(''),
    rate: decimalStringSchema.default(''),
    commission: decimalStringSchema.default(''),
    commissionSnapshot: yup.mixed().nullable().default(null),
    pricingRuleSnapshot: yup.mixed().nullable().default(null),
    total: decimalStringSchema.default(''),
    roundOff: signedDecimalStringSchema.default(''),
    finalAmount: decimalStringSchema.default(''),
    cardId: yup.string().default(''),
    issuerPartyProfileId: yup.string().default(''),
    issuerPartyProfileSnapshot: yup.mixed().nullable().default(null),
    cardSnapshot: yup.mixed().nullable().default(null),
    isReload: yup.boolean().default(false),
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
    settlementSource: yup
      .mixed<'NORMAL' | 'ADVANCE'>()
      .oneOf(['NORMAL', 'ADVANCE'])
      .default('NORMAL'),
    advanceVoucherId: yup
      .string()
      .trim()
      .when('settlementSource', {
        is: 'ADVANCE',
        then: schema => schema.required('Advance voucher is required'),
        otherwise: schema => schema.default(''),
      }),
    paymentMethod: yup
      .mixed<
        (typeof TransactionPaymentMethodEnum)[keyof typeof TransactionPaymentMethodEnum]
      >()
      .oneOf([
        TransactionPaymentMethodEnum.CASH,
        TransactionPaymentMethodEnum.CHEQUE,
      ])
      .required('Payment mode is required'),
    accountId: yup.string().trim().required('Account is required'),
    accountName: yup.string().trim().default(''),
    chequePageId: yup
      .string()
      .trim()
      .when(['paymentMethod', 'settlementSource'], {
        is: (paymentMethod: string, settlementSource: string) =>
          paymentMethod === TransactionPaymentMethodEnum.CHEQUE &&
          settlementSource !== 'ADVANCE',
        then: schema =>
          transactionType === TransactionTypeEnum.PURCHASE
            ? schema.required('Cheque page is required')
            : schema.default(''),
        otherwise: schema => schema.default(''),
      }),
    chequePageSnapshot: yup.mixed().nullable().default(null),
    chequeNumber: yup
      .string()
      .trim()
      .when('paymentMethod', {
        is: TransactionPaymentMethodEnum.CHEQUE,
        then: schema => schema.required('Cheque / book reference is required'),
        otherwise: schema => schema.default(''),
      }),
    chequeDate: yup
      .string()
      .trim()
      .when('paymentMethod', {
        is: TransactionPaymentMethodEnum.CHEQUE,
        then: schema => schema.required('Cheque date is required'),
        otherwise: schema => schema.default(''),
      }),
    branchName: yup
      .string()
      .trim()
      .when('paymentMethod', {
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
    .mixed<
      | (typeof PassengerOtherIdProofTypeEnum)[keyof typeof PassengerOtherIdProofTypeEnum]
      | ''
    >()
    .oneOf([...Object.values(PassengerOtherIdProofTypeEnum), ''] as const)
    .required('Document type is required'),
  documentNumber: yup
    .string()
    .trim()
    .when('documentType', {
      is: (documentType: string) => Boolean(documentType),
      then: schema => schema.required('Document number is required'),
      otherwise: schema => schema.default(''),
    }),
  validTill: yup
    .string()
    .trim()
    .when('documentType', {
      is: (documentType: string) =>
        shouldShowPassengerOtherDocumentValidityFields(documentType),
      then: schema => schema.required('Valid till is required'),
      otherwise: schema => schema.default(''),
    }),
  issueAt: yup.string().trim().default(''),
  issueDate: yup.string().trim().default(''),
  expiryDate: yup.string().trim().default(''),
  documentFile: yup.string().trim().default(''),
});

export const createPurchaseFormSchema = (transactionType: TransactionType) =>
  yup.object({
    purchasePageType: yup
      .mixed<PurchasePageType>()
      .oneOf(
        Object.values(TransactionTypeProfileEnum).filter(
          value => value !== TransactionTypeProfileEnum.CARD_STOCK_RECEIPT
        ) as PurchasePageType[]
      )
      .nullable()
      .default(null),
    branchId: yup.string().trim().required('Branch is required'),
    branchSnapshot: yup.mixed().nullable().default(null),
    counterId: yup.string().trim().required('Counter is required'),
    transactionDate: yup
      .string()
      .trim()
      .required('Transaction date is required'),
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
    transactionPartyProfileType: yup
      .mixed<
        | (typeof TransactionPartyProfileTypeEnum)[keyof typeof TransactionPartyProfileTypeEnum]
        | ''
      >()
      .oneOf([...Object.values(TransactionPartyProfileTypeEnum), ''] as const)
      .when('purchasePageType', {
        is: (value: PurchasePageType | null) =>
          requiresCorporateIndividualPassenger(value),
        then: schema => schema.required('Entity selection is required'),
        otherwise: schema => schema.default(''),
      }),
    purposeId: yup
      .string()
      .trim()
      .when('purchasePageType', {
        is: (value: PurchasePageType | null) =>
          requiresCorporateIndividualPassenger(value),
        then: schema => schema.required('Purpose is required'),
        otherwise: schema => schema.default(''),
      }),
    agentProfileId: yup.string().trim().default(''),
    agentProfileCode: yup.string().trim().default(''),
    agentProfileName: yup.string().trim().default(''),
    entityType: yup
      .mixed<
        | (typeof PassengerEntityTypeEnum)[keyof typeof PassengerEntityTypeEnum]
        | ''
      >()
      .oneOf([...Object.values(PassengerEntityTypeEnum), ''] as const)
      .when('purchasePageType', {
        is: (value: PurchasePageType | null) =>
          requiresCorporateIndividualPassenger(value),
        then: schema => schema.required('Passenger entity type is required'),
        otherwise: schema => schema.default(''),
      }),
    passengerInfoCaptured: yup
      .boolean()
      .default(false)
      .when('purchasePageType', {
        is: (value: PurchasePageType | null) =>
          requiresCorporateIndividualPassenger(value),
        then: schema => schema.oneOf([true], 'Passenger details are required'),
        otherwise: schema => schema.default(false),
      }),
    passengerId: yup.string().default(''),
    nationalityType: yup
      .mixed<
        | (typeof PassengerNationalityTypeEnum)[keyof typeof PassengerNationalityTypeEnum]
        | ''
      >()
      .oneOf([...Object.values(PassengerNationalityTypeEnum), ''] as const)
      .when('purchasePageType', {
        is: (value: PurchasePageType | null) =>
          requiresCorporateIndividualPassenger(value),
        then: schema => schema.required('Nationality is required'),
        otherwise: schema => schema.default(''),
      }),
    residentStatus: yup
      .mixed<
        | (typeof PassengerResidentStatusEnum)[keyof typeof PassengerResidentStatusEnum]
        | ''
      >()
      .oneOf([...Object.values(PassengerResidentStatusEnum), ''] as const)
      .when('purchasePageType', {
        is: (value: PurchasePageType | null) =>
          requiresCorporateIndividualPassenger(value),
        then: schema => schema.required('Resident status is required'),
        otherwise: schema => schema.default(''),
      }),
    countryId: yup
      .string()
      .trim()
      .when('purchasePageType', {
        is: (value: PurchasePageType | null) =>
          requiresCorporateIndividualPassenger(value),
        then: schema => schema.required('Country is required'),
        otherwise: schema => schema.default(''),
      }),
    stateId: yup.string().trim().default(''),
    locationId: yup.string().trim().default(''),
    city: yup.string().trim().default(''),
    address1: yup.string().trim().default(''),
    address2: yup.string().trim().default(''),
    email: yup.string().trim().default(''),
    contactNo: yup.string().trim().default(''),
    loanAmount: decimalStringSchema.default(''),
    declaredAmount: decimalStringSchema.default(''),
    preTcsFinalAmount: decimalStringSchema.default(''),
    tcsRatePercent: decimalStringSchema.default(''),
    tcsRateType: yup
      .mixed<
        (typeof PurposeRateTypeEnum)[keyof typeof PurposeRateTypeEnum] | ''
      >()
      .oneOf([...Object.values(PurposeRateTypeEnum), ''] as const)
      .default(''),
    tcsAmount: decimalStringSchema.default(''),
    itrFiled: yup.boolean().default(false),
    tcsDeclarationAccepted: yup.boolean().default(false),
    isProprietorship: yup.boolean().default(false),
    cdfNo: yup.string().trim().default(''),
    cdfIssuingAuthority: yup.string().trim().default(''),
    cdfApprovedUsd: decimalStringSchema.default(''),
    cdfArrivalDate: yup.string().trim().default(''),
    panNumber: yup
      .string()
      .trim()
      .test(
        'pan-required',
        PASSENGER_IDENTITY_TEXT.panNumberRequired,
        function (value) {
          if (
            !requiresCorporateIndividualPassenger(this.parent.purchasePageType)
          ) {
            return true;
          }
          const error = getPassengerPanNumberError({
            ...this.parent,
            panNumber: value,
          });
          if (!error) {
            return true;
          }
          return this.createError({ message: error });
        }
      ),
    panHolderName: yup
      .string()
      .trim()
      .test(
        'pan-holder-name-required',
        PASSENGER_IDENTITY_TEXT.panHolderNameRequired,
        function (value) {
          if (
            !requiresCorporateIndividualPassenger(this.parent.purchasePageType)
          ) {
            return true;
          }
          if (
            !isPassengerPanRequired({ ...this.parent, panHolderName: value })
          ) {
            return true;
          }
          return Boolean(String(value ?? '').trim());
        }
      ),
    panDob: yup
      .string()
      .trim()
      .test(
        'pan-dob-required',
        PASSENGER_IDENTITY_TEXT.panDobRequired,
        function (value) {
          if (
            !requiresCorporateIndividualPassenger(this.parent.purchasePageType)
          ) {
            return true;
          }
          if (!isPassengerPanRequired({ ...this.parent, panDob: value })) {
            return true;
          }
          return Boolean(String(value ?? '').trim());
        }
      ),
    panHolderRelationType: yup
      .string()
      .trim()
      .test(
        'pan-relation-required',
        PASSENGER_IDENTITY_TEXT.panHolderRelationRequired,
        function (value) {
          if (
            !requiresCorporateIndividualPassenger(this.parent.purchasePageType)
          ) {
            return true;
          }
          if (
            !isPassengerPanHolderRelationRequired({
              ...this.parent,
              panHolderRelationType: value,
            })
          ) {
            return true;
          }
          return Boolean(String(value ?? '').trim());
        }
      ),
    paidByPanNumber: yup.string().trim().default(''),
    paidByPanHolderName: yup.string().trim().default(''),
    paidByPanDob: yup.string().trim().default(''),
    gstNumber: yup.string().trim().default(''),
    gstStateId: yup.string().trim().default(''),
    isPep: yup.boolean().default(false),
    passportNumber: yup
      .string()
      .trim()
      .test(
        'passport-number-required',
        PASSENGER_IDENTITY_TEXT.passportNumberRequired,
        function (value) {
          if (
            !requiresCorporateIndividualPassenger(this.parent.purchasePageType)
          ) {
            return true;
          }
          if (
            !isPassengerPassportRequired({
              ...this.parent,
              passportNumber: value,
            })
          ) {
            return true;
          }
          return Boolean(String(value ?? '').trim());
        }
      ),
    passportIssueAt: yup
      .string()
      .trim()
      .test(
        'passport-issue-at-required',
        PASSENGER_IDENTITY_TEXT.passportIssuePlaceRequired,
        function (value) {
          if (
            !requiresCorporateIndividualPassenger(this.parent.purchasePageType)
          ) {
            return true;
          }
          if (
            !isPassengerPassportRequired({
              ...this.parent,
              passportIssueAt: value,
            })
          ) {
            return true;
          }
          return Boolean(String(value ?? '').trim());
        }
      ),
    passportIssueDate: yup
      .string()
      .trim()
      .test(
        'passport-issue-date-required',
        PASSENGER_IDENTITY_TEXT.passportIssueDateRequired,
        function (value) {
          if (
            !requiresCorporateIndividualPassenger(this.parent.purchasePageType)
          ) {
            return true;
          }
          if (
            !isPassengerPassportRequired({
              ...this.parent,
              passportIssueDate: value,
            })
          ) {
            return true;
          }
          return Boolean(String(value ?? '').trim());
        }
      ),
    passportExpiryDate: yup
      .string()
      .trim()
      .test(
        'passport-expiry-date-required',
        PASSENGER_IDENTITY_TEXT.passportExpiryDateRequired,
        function (value) {
          if (
            !requiresCorporateIndividualPassenger(this.parent.purchasePageType)
          ) {
            return true;
          }
          if (
            !isPassengerPassportRequired({
              ...this.parent,
              passportExpiryDate: value,
            })
          ) {
            return true;
          }
          return Boolean(String(value ?? '').trim());
        }
      )
      .test(
        'passport-date-order',
        'Passport expiry date must be after issue date',
        function (value) {
          if (
            !requiresCorporateIndividualPassenger(this.parent.purchasePageType)
          ) {
            return true;
          }
          const issueDate = this.parent.passportIssueDate as string | undefined;
          if (!issueDate || !value) {
            return true;
          }
          return new Date(value) >= new Date(issueDate);
        }
      ),
    arrivalDate: yup
      .string()
      .trim()
      .test(
        'arrival-date-required',
        PASSENGER_IDENTITY_TEXT.arrivalDateRequired,
        function (value) {
          if (
            !requiresCorporateIndividualPassenger(this.parent.purchasePageType)
          ) {
            return true;
          }
          if (
            !isPassengerArrivalDateRequired({
              ...this.parent,
              arrivalDate: value,
            })
          ) {
            return true;
          }
          return Boolean(String(value ?? '').trim());
        }
      ),
    travelAirlineId: yup.string().trim().default(''),
    travelTicketNo: yup.string().trim().default(''),
    travelRoute: yup.string().trim().default(''),
    travelCountryId: yup
      .string()
      .trim()
      .default('')
      .test(
        'card-reload-travel-country',
        'Travel country is required for CARD reload',
        function (value) {
          const rows = Array.isArray(this.parent.transactions)
            ? this.parent.transactions
            : [];
          return (
            !rows.some((row: { cardId?: string; isReload?: boolean }) =>
              Boolean(row?.cardId && row?.isReload)
            ) || Boolean(value)
          );
        }
      ),
    travelNoOfDays: yup.string().trim().default(''),
    travelNoOfPax: yup.string().trim().default(''),
    travelDepartureDate: yup.string().trim().default(''),
    travelPnr: yup.string().trim().default(''),
    travelVisa: yup.boolean().default(false),
    travelIsCisCountry: yup.boolean().default(false),
    otherDocuments: yup
      .array()
      .of(passengerOtherDocumentSchema)
      .default([])
      .transform(rows =>
        Array.isArray(rows)
          ? rows.filter(row => isPassengerOtherDocumentFilled(row))
          : []
      ),
    manualBookReferenceType: manualBookReferenceTypeSchema,
    manualBookId: yup
      .string()
      .trim()
      .required('Manual book reference is required'),
    manualBookNo: yup.string().trim().default(''),
    manualBookPageId: yup
      .string()
      .trim()
      .required('Manual book page is required'),
    manualBookPageSnapshot: yup.mixed().nullable().default(null),
    cashierUserId: yup.string().trim().default(''),
    cashierUserCode: yup.string().trim().default(''),
    cashierUserName: yup.string().trim().default(''),
    deliveryBoyUserId: yup
      .string()
      .trim()
      .when('manualBookReferenceType', {
        is: 'DELIVERY_BOY',
        then: schema => schema.required('Delivery boy is required'),
        otherwise: schema => schema.default(''),
      }),
    deliveryBoyUserCode: yup.string().trim().default(''),
    deliveryBoyUserName: yup.string().trim().default(''),
    number: yup.string().trim().default(''),
    transactions: yup
      .array()
      .of(createPurchaseTransactionSchema(transactionType))
      .min(1, 'Add at least one transaction')
      .required()
      .test(
        'unique-card-currency',
        'The same CARD cannot be selected more than once for the same currency',
        rows => {
          const keys = (rows ?? [])
            .filter((row: { cardId?: string; currencyId?: string }) =>
              Boolean(row?.cardId && row?.currencyId)
            )
            .map(
              (row: { cardId?: string; currencyId?: string }) =>
                `${row.cardId}:${row.currencyId}`
            );
          return new Set(keys).size === keys.length;
        }
      )
      .test(
        'unique-single-currency-card',
        'Single-currency CARD (CC) cannot be selected more than once in one transaction',
        rows => {
          const ccCardIds = (rows ?? [])
            .filter(
              (row: { cardId?: string; productCode?: string }) =>
                Boolean(row?.cardId) &&
                String(row?.productCode ?? '').toUpperCase() === 'CC'
            )
            .map((row: { cardId?: string }) => String(row.cardId));
          return new Set(ccCardIds).size === ccCardIds.length;
        }
      ),
    additionalCharges: yup
      .array()
      .of(additionalChargeSchema)
      .default([])
      .test(
        'charge-amount-exceeds-total',
        'Total additional charges cannot exceed the total transaction amount',
        function (charges) {
          const transactions = this.parent.transactions ?? [];

          const totalTransactionAmount = transactions.reduce(
            (sum: number, t: Record<string, unknown>) =>
              sum + Number(t.finalAmount ?? t.total ?? 0),
            0
          );

          const totalAdditionalCharges = (charges ?? []).reduce(
            (sum, c) => sum + Number(c.amount ?? 0),
            0
          );

          return totalAdditionalCharges <= totalTransactionAmount;
        }
      ),
    paymentDetails: yup
      .array()
      .default([])
      .when('purchasePageType', {
        is: (value: PurchasePageType | null) =>
          requiresCorporateIndividualPassenger(value),
        then: schema =>
          schema
            .of(createPaymentDetailSchema(transactionType))
            .min(1, 'Add at least one payment detail')
            .required('Add at least one payment detail'),
        otherwise: schema =>
          schema.test(
            'optional-payment-rows',
            'Invalid payment detail',
            function validateOptionalPaymentRows(rows) {
              const paymentDetailSchema =
                createPaymentDetailSchema(transactionType);

              for (const row of rows ?? []) {
                if (!shouldValidatePaymentDetailRow(row)) {
                  continue;
                }

                try {
                  paymentDetailSchema.validateSync(row, { abortEarly: true });
                } catch (error) {
                  if (error instanceof yup.ValidationError) {
                    return this.createError({
                      message: error.errors[0] ?? 'Invalid payment detail',
                    });
                  }

                  throw error;
                }
              }

              return true;
            }
          ),
      })
      .test(
        'same-method',
        'All payment rows must use the same method',
        rows => {
          const methods = (rows ?? [])
            .map(row => row?.paymentMethod?.trim?.() ?? '')
            .filter(Boolean);
          if (methods.length <= 1) {
            return true;
          }

          return new Set(methods).size === 1;
        }
      ),
  });

export const purchaseFormSchema = createPurchaseFormSchema(
  TransactionTypeEnum.PURCHASE
);
