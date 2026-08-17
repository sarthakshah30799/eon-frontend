import type {
  ICurrencyRateComparisonPreview,
  ICurrencyRateMargin,
  CurrencyRateMarginType,
} from '@/modules/currencyRates/types/currencyRatesTypes';
import {
  TransactionDocumentStatusEnum,
  TransactionPartyProfileTypeEnum,
  TransactionPaymentMethodEnum,
  TradeModeEnum,
  TransactionTypeEnum,
  TransactionTypeProfileEnum,
} from '@/modules/transactions';
import type { TradeMode, TransactionType } from '@/modules/transactions';
import {
  buildCurrencyRateComparisonPreview,
  getCurrencyPricingGroup,
  getLatestRateForCurrency,
} from '@/modules/currencyRates/utils/currencyRatesUtils';
import type { ITransactionReferenceSnapshot } from '@/modules/transactions';
import {
  getPurchasePageEntityType,
  type PurchasePageType,
} from '@/pages/purchase/[slug]/purchasePage.enum';
import type { IPartyProfileCommissionRule } from '@/modules/partyProfiles/types';
import type { PurposeRateType } from '@/modules/purpose/types/purposeTypes';
import {
  PassengerNationalityTypeEnum,
  PassengerResidentStatusEnum,
} from '@/modules/passengers/types/passengerTypes';
import type {
  PassengerNationalityType,
  PassengerResidentStatus,
} from '@/modules/passengers/types/passengerTypes';
import type {
  IPurchaseDocumentAttachment,
  IPurchaseFormValues,
  IPurchasePricingData,
  IPurchaseTransactionFormRow,
  IPurchaseSubmitPayload,
} from '../types/purchaseTypes';
import type { ITransactionEntity } from '@/modules/transactions';

const EMPTY_MARGIN: ICurrencyRateMargin = {
  marginType: '',
  marginValue: '',
  minRate: '',
  maxRate: '',
};

export const PURCHASE_RATE_DECIMALS = 7;
export const PURCHASE_MONEY_DECIMALS = 2;
export const CARD_PRODUCT_CODE = 'CC';

export const isCardProductCode = (productCode?: string | null) =>
  String(productCode ?? '').toUpperCase() === CARD_PRODUCT_CODE;

export const PURCHASE_TRANSACTION_TEXT = {
  quantityLabel: 'Quantity',
  denominationLabel: 'Denomination',
  feAmountLabel: 'FE Amount',
  quantityRequired: 'Quantity is required',
  feAmountRequired: 'FE Amount is required',
  feAmountPositive: 'FE Amount must be greater than 0',
  cardSaleHint: 'Select an issuer and eligible card before entering the FE amount.',
  cardPurchaseHint: 'Select an issuer and eligible card before entering the denomination.',
} as const;

export const formatPurchaseDecimal = (
  value?: string | number | null,
  decimals = PURCHASE_MONEY_DECIMALS
) => {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue)
    ? parsedValue.toFixed(decimals)
    : String(value);
};

export const createStaticLoadOptions =
  (options: { value: string; label: string }[]) => async (inputValue: string) => ({
    options: inputValue
      ? options.filter(opt => opt.label.toLowerCase().includes(inputValue.toLowerCase()))
      : options,
    hasMore: false,
  });

export const createEmptyPurchaseTransactionRow =
  (): IPurchaseTransactionFormRow => ({
    currencyId: '',
    currencyCode: '',
    currencyName: '',
    productId: '',
    productCode: '',
    productDescription: '',
    quantity: '',
    per: '',
    rate: '',
    commission: '',
    commissionSnapshot: null,
    pricingRuleSnapshot: null,
    total: '',
    roundOff: '',
    finalAmount: '',
    cardId: '',
    issuerPartyProfileId: '',
    issuerPartyProfileSnapshot: null,
    cardSnapshot: null,
    isReload: false,
  });

export const createEmptyPurchaseFormValues = (
  transactionType: TransactionType = TransactionTypeEnum.PURCHASE,
  tradeMode: TradeMode = TradeModeEnum.BULK,
  purchasePageType: PurchasePageType | null = null,
  branchSnapshot: ITransactionReferenceSnapshot | null = null,
  branchId = '',
  counterId = '',
  transactionDate = ''
): IPurchaseFormValues => ({
  purchasePageType,
  branchId,
  branchSnapshot,
  counterId,
  transactionDate,
  transactionType,
  tradeMode,
  transactionPartyProfileType:
    purchasePageType ===
      TransactionTypeProfileEnum.PURCHASE_CORPORATE_INDIVIDUAL ||
    purchasePageType === TransactionTypeProfileEnum.SALE_CORPORATE_INDIVIDUAL
      ? TransactionPartyProfileTypeEnum.CORPORATE
      : '',
  partyProfileId: '',
  partyProfileCode: '',
  partyProfileName: '',
  partyProfileEmail: '',
  partyProfilePhoneNo: '',
  partyProfileAddress1: '',
  partyProfileAddress2: '',
  partyProfileAddress3: '',
  partyProfileCity: '',
  partyProfilePinCode: '',
  partyProfilePanNo: '',
  partyProfileGstNo: '',
  partyProfileGstStateName: '',
  partyProfileStateName: '',
  partyProfileContactName: '',
  partyProfileApplyTax: false,
  purposeId: '',
  agentProfileId: '',
  agentProfileCode: '',
  agentProfileName: '',
  entityType: getPurchasePageEntityType(purchasePageType) ?? '',
  passengerInfoCaptured: false,
  passengerId: '',
  panNumber: '',
  panHolderName: '',
  panDob: '',
  passportNumber: '',
  passportIssueAt: '',
  passportIssueDate: '',
  passportExpiryDate: '',
  nationalityType: PassengerNationalityTypeEnum.INDIAN,
  residentStatus: PassengerResidentStatusEnum.RESIDENT,
  countryId: '',
  stateId: '',
  locationId: '',
  city: '',
  address1: '',
  address2: '',
  email: '',
  contactNo: '',
  loanAmount: '',
  declaredAmount: '',
  preTcsFinalAmount: '',
  tcsRatePercent: '',
  tcsRateType: '',
  tcsAmount: '',
  itrFiled: false,
  tcsDeclarationAccepted: false,
  isProprietorship: false,
  cdfNo: '',
  cdfIssuingAuthority: '',
  cdfApprovedUsd: '',
  cdfArrivalDate: '',
  panHolderRelationType: '',
  paidByPanNumber: '',
  paidByPanHolderName: '',
  paidByPanDob: '',
  gstNumber: '',
  gstStateId: '',
  isPep: false,
  arrivalDate: '',
  travelAirlineId: '',
  travelTicketNo: '',
  travelRoute: '',
  travelCountryId: '',
  travelNoOfDays: '',
  travelNoOfPax: '',
  travelDepartureDate: '',
  travelPnr: '',
  travelVisa: false,
  travelIsCisCountry: false,
  otherDocuments: [
    {
      documentType: '',
      documentNumber: '',
      validTill: '',
      issueAt: '',
      issueDate: '',
      expiryDate: '',
      documentFile: '',
    },
  ],
  manualBookReferenceType: 'CASHIER',
  manualBookId: '',
  manualBookNo: '',
  manualBookPageId: '',
  manualBookPageSnapshot: null,
  cashierUserId: '',
  cashierUserCode: '',
  cashierUserName: '',
  deliveryBoyUserId: '',
  deliveryBoyUserCode: '',
  deliveryBoyUserName: '',
  number: '',
  transactions: [createEmptyPurchaseTransactionRow()],
  additionalCharges: [],
  paymentDetails: [],
});

export const createEmptyPurchasePaymentRow = (
  overrides: Partial<{
    settlementSource: 'NORMAL' | 'ADVANCE';
    advanceVoucherId: string;
    advanceVoucherNumber: string;
    advanceAvailableAmount: string;
    isAdvanceRemainder: boolean;
    amountLocked: boolean;
    paymentMethod: string;
    accountId: string;
    accountName: string;
    chequePageId: string;
    chequePageSnapshot: Record<string, unknown> | null;
    chequeNumber: string;
    chequeDate: string;
    branchName: string;
    drawnOn: string;
    amount: string;
    remarks: string;
  }> = {}
) => ({
  settlementSource: overrides.settlementSource ?? 'NORMAL',
  advanceVoucherId: overrides.advanceVoucherId ?? '',
  advanceVoucherNumber: overrides.advanceVoucherNumber ?? '',
  advanceAvailableAmount: overrides.advanceAvailableAmount ?? '',
  isAdvanceRemainder: overrides.isAdvanceRemainder ?? false,
  amountLocked: overrides.amountLocked ?? false,
  paymentMethod: overrides.paymentMethod ?? '',
  accountId: overrides.accountId ?? '',
  accountName: overrides.accountName ?? '',
  chequePageId: overrides.chequePageId ?? '',
  chequePageSnapshot: overrides.chequePageSnapshot ?? null,
  chequeNumber: overrides.chequeNumber ?? '',
  chequeDate: overrides.chequeDate ?? '',
  branchName: overrides.branchName ?? '',
  drawnOn: overrides.drawnOn ?? '',
  amount: overrides.amount ?? '',
  remarks: overrides.remarks ?? '',
});

export const mapPurchaseFormValuesToSubmitPayload = (
  values: IPurchaseFormValues,
  attachments: IPurchaseDocumentAttachment[],
  requiresApproval: boolean
): IPurchaseSubmitPayload => {
  console.log(
    'Mapping purchase form values to submit payload:',
    values,
    attachments,
    requiresApproval
  );
  if (!values.purchasePageType) {
    throw new Error('Transaction slug is required');
  }

  return {
    transaction: {
      branchId: values.branchId || null,
      counterId: values.counterId || null,
      branchSnapshot: values.branchSnapshot,
      requiresApproval,
      slug: values.purchasePageType,
      transactionDate: values.transactionDate || null,
      partyProfileId: values.partyProfileId,
      transactionPartyProfileType: values.transactionPartyProfileType || null,
      purposeId: values.purposeId || null,
      agentProfileId: values.agentProfileId || null,
      loanAmount: values.loanAmount || null,
      declaredAmount: values.declaredAmount || null,
      preTcsFinalAmount: values.preTcsFinalAmount || null,
      tcsRatePercent: values.tcsRatePercent || null,
      tcsRateType: values.tcsRateType || null,
      tcsAmount: values.tcsAmount || null,
      itrFiled: values.itrFiled,
      tcsDeclarationAccepted: values.tcsDeclarationAccepted,
      isProprietorship: values.isProprietorship,
      cdfNo: values.cdfNo || null,
      cdfIssuingAuthority: values.cdfIssuingAuthority || null,
      cdfApprovedUsd: values.cdfApprovedUsd || null,
      cdfArrivalDate: values.cdfArrivalDate || null,
      passenger: values.passengerInfoCaptured
        ? {
            entityType: values.entityType || '',
            nationalityType:
              values.nationalityType || PassengerNationalityTypeEnum.INDIAN,
            residentStatus:
              values.residentStatus || PassengerResidentStatusEnum.RESIDENT,
            countryId: values.countryId,
            stateId: values.stateId || null,
            locationId: values.locationId || null,
            city: values.city || null,
            address1: values.address1 || null,
            address2: values.address2 || null,
            email: values.email || null,
            contactNo: values.contactNo || null,
            panNumber: values.panNumber || null,
            panHolderName: values.panHolderName || null,
            panDob: values.panDob || null,
            panHolderRelationType: values.panHolderRelationType || null,
            paidByPanNumber: values.paidByPanNumber || null,
            paidByPanHolderName: values.paidByPanHolderName || null,
            paidByPanDob: values.paidByPanDob || null,
            gstNumber: values.gstNumber || null,
            gstStateId: values.gstStateId || null,
            passportNumber: values.passportNumber || null,
            passportIssueAt: values.passportIssueAt || null,
            passportIssueDate: values.passportIssueDate || null,
            passportExpiryDate: values.passportExpiryDate || null,
            arrivalDate: values.arrivalDate || null,
            isPep: values.isPep,
            otherDocuments: values.otherDocuments
              .filter(
                document =>
                  Boolean(document.documentType?.trim?.()) ||
                  Boolean(document.documentNumber?.trim?.()) ||
                  Boolean(document.validTill?.trim?.()) ||
                  Boolean(document.documentFile?.trim?.())
              )
              .map(document => ({
                documentType: document.documentType,
                documentNumber: document.documentNumber,
                validTill: document.validTill || null,
                issueAt: document.issueAt || null,
                issueDate: document.issueDate || null,
                expiryDate: document.expiryDate || null,
                remarks: null,
              })),
          }
        : null,
      passengerTravel:
        values.transactionType === TransactionTypeEnum.SALE &&
        values.passengerInfoCaptured
          ? {
              airlineTtId: values.travelAirlineId || null,
              ticketNo: values.travelTicketNo || null,
              route: values.travelRoute || null,
              travellingCountryId: values.travelCountryId || null,
              noOfDays: values.travelNoOfDays
                ? Number(values.travelNoOfDays)
                : null,
              noOfPax: values.travelNoOfPax ? Number(values.travelNoOfPax) : null,
              departureDate: values.travelDepartureDate || null,
              travelPnr: values.travelPnr || null,
              visa: values.travelVisa,
              isCisCountry: values.travelIsCisCountry,
            }
          : null,
      manualBookPageId: values.manualBookPageId || null,
      manualBookPageSnapshot: values.manualBookPageSnapshot ?? null,
      transactionType: values.transactionType,
      tradeMode: values.tradeMode,
      remarks: null,
      items: values.transactions.map(row => ({
        currencyId: row.currencyId,
        productId: row.productId,
        quantity: row.quantity,
        per: row.per,
        rate: row.rate,
        commission: row.commission || null,
        commissionSnapshot: row.commissionSnapshot ?? null,
        pricingRuleSnapshot: row.pricingRuleSnapshot ?? null,
        remarks: null,
        cardId: row.cardId || null,
        issuerPartyProfileId: row.issuerPartyProfileId || null,
        issuerPartyProfileSnapshot: row.issuerPartyProfileSnapshot ?? null,
        cardSnapshot: row.cardSnapshot ?? null,
        isReload: Boolean(row.isReload),
      })),
      documents: attachments.map(attachment => ({
        documentProfileId: attachment.documentProfileId,
        status: TransactionDocumentStatusEnum.ATTACHED,
        remarks: null,
      })),
      additionalCharges: values.additionalCharges.map(row => ({
        accountId: row.accountId,
        amount: row.amount,
        gstRate: row.gstRate || null,
        gstAmount: row.gstAmount || null,
        applyTax: Boolean(values.partyProfileApplyTax),
        remarks: null,
      })),
      payments: values.paymentDetails.map(row => ({
        accountId: row.accountId,
        settlementSource: row.settlementSource ?? 'NORMAL',
        advanceVoucherId:
          row.settlementSource === 'ADVANCE'
            ? row.advanceVoucherId || null
            : null,
        paymentMethod:
          row.paymentMethod === TransactionPaymentMethodEnum.CASH
            ? TransactionPaymentMethodEnum.CASH
            : TransactionPaymentMethodEnum.CHEQUE,
        referenceNumber: row.chequeNumber,
        referenceDate:
          row.paymentMethod === TransactionPaymentMethodEnum.CHEQUE
            ? (row.chequeDate || null)
            : null,
        branchName: row.branchName,
        drawnOn: row.drawnOn || null,
        chequePageId:
          row.paymentMethod === TransactionPaymentMethodEnum.CHEQUE
            ? (row.chequePageId ?? null)
            : null,
        chequePageSnapshot:
          row.paymentMethod === TransactionPaymentMethodEnum.CHEQUE
            ? (row.chequePageSnapshot ?? null)
            : null,
        amount: row.amount,
        remarks: null,
      })),
    },
    attachments,
  };
};

export const mapPurchaseTransactionToFormValues = (
  transaction: ITransactionEntity,
  purchasePageType: PurchasePageType | null
): IPurchaseFormValues => {
  const transactionSnapshot = transaction as unknown as Record<string, unknown>;
  const passengerSnapshot = transaction.passengerSnapshot as
    | Record<string, unknown>
    | null
    | undefined;
  const passengerTravelSnapshot = transaction.passengerTravelSnapshot as
    | {
        airlineTt?: { id?: string } | null;
        ticketNo?: string | null;
        route?: string | null;
        travellingCountry?: { id?: string } | null;
        noOfDays?: number | null;
        noOfPax?: number | null;
        departureDate?: string | null;
        travelPnr?: string | null;
        visa?: boolean | null;
        isCisCountry?: boolean | null;
      }
    | null
    | undefined;
  const passengerOtherDocuments = passengerSnapshot?.otherDocuments as
    | Array<{
        documentType?: string | null;
        documentNumber?: string | null;
        validTill?: string | null;
        issueAt?: string | null;
        issueDate?: string | null;
        expiryDate?: string | null;
        documentFile?: string | null;
      }>
    | undefined;

  return {
  purchasePageType,
  branchId: transaction.branchId ?? '',
  branchSnapshot: transaction.branchSnapshot ?? null,
  counterId: transaction.counterId ?? '',
  transactionDate: transaction.transactionDate
    ? String(transaction.transactionDate).slice(0, 10)
    : '',
  transactionType: transaction.transactionType,
  tradeMode: transaction.tradeMode,
  partyProfileId: transaction.partyProfileId ?? '',
  partyProfileCode: transaction.partyProfileSnapshot?.code ?? '',
  partyProfileName: transaction.partyProfileSnapshot?.name ?? '',
  partyProfileEmail:
    (transaction.partyProfileSnapshot?.email as string | undefined) ?? '',
  partyProfilePhoneNo:
    (transaction.partyProfileSnapshot?.phoneNo as string | undefined) ?? '',
  partyProfileAddress1:
    (transaction.partyProfileSnapshot?.address1 as string | undefined) ?? '',
  partyProfileAddress2:
    (transaction.partyProfileSnapshot?.address2 as string | undefined) ?? '',
  partyProfileAddress3:
    (transaction.partyProfileSnapshot?.address3 as string | undefined) ?? '',
  partyProfileCity:
    (transaction.partyProfileSnapshot?.city as string | undefined) ?? '',
  partyProfilePinCode:
    (transaction.partyProfileSnapshot?.pinCode as string | undefined) ?? '',
  partyProfilePanNo:
    (transaction.partyProfileSnapshot?.panNo as string | undefined) ?? '',
  partyProfileGstNo:
    (transaction.partyProfileSnapshot?.gstNo as string | undefined) ?? '',
  partyProfileGstStateName:
    (transaction.partyProfileSnapshot?.gstStateName as string | undefined) ??
    '',
  partyProfileStateName:
    (transaction.partyProfileSnapshot?.stateName as string | undefined) ?? '',
  partyProfileContactName:
    (transaction.partyProfileSnapshot?.contactName as string | undefined) ?? '',
  partyProfileApplyTax: Boolean(transaction.partyProfileSnapshot?.applyTax),
  agentProfileId: transaction.agentProfileId ?? '',
  agentProfileCode: transaction.agentProfileSnapshot?.code ?? '',
  agentProfileName: transaction.agentProfileSnapshot?.name ?? '',
  purposeId: transaction.purposeId ?? '',
  transactionPartyProfileType: transaction.transactionPartyProfileType ?? '',
  entityType: passengerSnapshot?.entityType
    ? String(passengerSnapshot.entityType)
    : '',
  passengerInfoCaptured: Boolean(transaction.passengerId),
  passengerId: transaction.passengerId ?? '',
  panNumber:
    (passengerSnapshot?.panNumber as string | undefined) ?? '',
  panHolderName:
    (passengerSnapshot?.panHolderName as string | undefined) ?? '',
  panDob: (passengerSnapshot?.panDob as string | undefined) ?? '',
  passportNumber:
    (passengerSnapshot?.passportNumber as string | undefined) ?? '',
  passportIssueAt:
    (passengerSnapshot?.passportIssueAt as string | undefined) ?? '',
  passportIssueDate:
    (passengerSnapshot?.passportIssueDate as string | undefined) ?? '',
  passportExpiryDate:
    (passengerSnapshot?.passportExpiryDate as string | undefined) ?? '',
  nationalityType:
    (passengerSnapshot?.nationalityType as PassengerNationalityType) ??
    PassengerNationalityTypeEnum.INDIAN,
  residentStatus:
    (passengerSnapshot?.residentStatus as PassengerResidentStatus) ??
    PassengerResidentStatusEnum.RESIDENT,
  countryId:
    (passengerSnapshot?.countryId as string | undefined) ??
    ((passengerSnapshot?.country as { id?: string } | null | undefined)?.id ??
      ''),
  stateId:
    (passengerSnapshot?.stateId as string | undefined) ??
    ((passengerSnapshot?.state as { id?: string } | null | undefined)?.id ??
      ''),
  locationId:
    (passengerSnapshot?.locationId as string | undefined) ??
    ((passengerSnapshot?.location as { id?: string } | null | undefined)?.id ??
      ''),
  city: (passengerSnapshot?.city as string | undefined) ?? '',
  address1: (passengerSnapshot?.address1 as string | undefined) ?? '',
  address2: (passengerSnapshot?.address2 as string | undefined) ?? '',
  email: (passengerSnapshot?.email as string | undefined) ?? '',
  contactNo:
    (passengerSnapshot?.contactNo as string | undefined) ?? '',
  loanAmount:
    (transaction.loanAmount as string | undefined) ?? '',
  declaredAmount:
    (transaction.declaredAmount as string | undefined) ?? '',
  preTcsFinalAmount:
    (transaction.preTcsFinalAmount as string | undefined) ?? '',
  tcsRatePercent:
    (transaction.tcsRatePercent as string | undefined) ?? '',
  tcsRateType:
    (transaction.tcsRateType as PurposeRateType | undefined) ?? '',
  tcsAmount: (transaction.tcsAmount as string | undefined) ?? '',
  itrFiled: Boolean(transaction.itrFiled),
  tcsDeclarationAccepted: Boolean(transaction.tcsDeclarationAccepted),
  isProprietorship: Boolean(transaction.isProprietorship),
  cdfNo: (transactionSnapshot.cdfNo as string | undefined) ?? '',
  cdfIssuingAuthority:
    (transactionSnapshot.cdfIssuingAuthority as string | undefined) ?? '',
  cdfApprovedUsd: (transactionSnapshot.cdfApprovedUsd as string | undefined) ?? '',
  cdfArrivalDate: (transactionSnapshot.cdfArrivalDate as string | undefined) ?? '',
  panHolderRelationType:
    (passengerSnapshot?.panHolderRelationType as string | undefined) ??
    '',
  paidByPanNumber:
    (passengerSnapshot?.paidByPanNumber as string | undefined) ?? '',
  paidByPanHolderName:
    (passengerSnapshot?.paidByPanHolderName as string | undefined) ??
    '',
  paidByPanDob:
    (passengerSnapshot?.paidByPanDob as string | undefined) ?? '',
  gstNumber: (passengerSnapshot?.gstNumber as string | undefined) ?? '',
  gstStateId:
    (passengerSnapshot?.gstStateId as string | undefined) ??
    ((passengerSnapshot?.gstState as { id?: string } | null | undefined)?.id ??
      ''),
  isPep: Boolean(passengerSnapshot?.isPep),
  arrivalDate:
    (passengerSnapshot?.arrivalDate as string | undefined) ?? '',
  travelAirlineId:
    (passengerTravelSnapshot?.airlineTt?.id as string | undefined) ??
    '',
  travelTicketNo:
    (passengerTravelSnapshot?.ticketNo as string | undefined) ?? '',
  travelRoute:
    (passengerTravelSnapshot?.route as string | undefined) ?? '',
  travelCountryId:
    (passengerTravelSnapshot?.travellingCountry?.id as string | undefined) ??
    '',
  travelNoOfDays:
    passengerTravelSnapshot?.noOfDays !== undefined &&
    passengerTravelSnapshot?.noOfDays !== null
      ? String(passengerTravelSnapshot.noOfDays)
      : '',
  travelNoOfPax:
    passengerTravelSnapshot?.noOfPax !== undefined &&
    passengerTravelSnapshot?.noOfPax !== null
      ? String(passengerTravelSnapshot.noOfPax)
      : '',
  travelDepartureDate:
    (passengerTravelSnapshot?.departureDate as string | undefined) ?? '',
  travelPnr:
    (passengerTravelSnapshot?.travelPnr as string | undefined) ?? '',
  travelVisa: Boolean(passengerTravelSnapshot?.visa),
  travelIsCisCountry: Boolean(passengerTravelSnapshot?.isCisCountry),
  otherDocuments: Array.isArray(passengerOtherDocuments)
    ? passengerOtherDocuments.map(document => ({
        documentType: document.documentType ?? '',
        documentNumber: document.documentNumber ?? '',
        validTill: document.validTill ?? '',
        issueAt: document.issueAt ?? '',
        issueDate: document.issueDate ?? '',
        expiryDate: document.expiryDate ?? '',
        documentFile: document.documentFile ?? '',
      }))
    : [
        {
          documentType: '',
          documentNumber: '',
          validTill: '',
          issueAt: '',
          issueDate: '',
          expiryDate: '',
          documentFile: '',
        },
      ],
  manualBookReferenceType: 'CASHIER',
  manualBookId: (
    transaction.manualBookPageSnapshot as
      | Record<string, unknown>
      | null
      | undefined
  )?.manualBookId
    ? String(
        (transaction.manualBookPageSnapshot as Record<string, unknown>)
          .manualBookId
      )
    : '',
  manualBookNo: (() => {
    const snapshot = transaction.manualBookPageSnapshot as
      | { manualBook?: { no?: string } }
      | null
      | undefined;
    return snapshot?.manualBook?.no ?? '';
  })(),
  manualBookPageId: transaction.manualBookPageId ?? '',
  manualBookPageSnapshot: transaction.manualBookPageSnapshot ?? null,
  cashierUserId: '',
  cashierUserCode: '',
  cashierUserName: '',
  deliveryBoyUserId: '',
  deliveryBoyUserCode: '',
  deliveryBoyUserName: '',
  number: transaction.number ?? '',
  transactions: (transaction.items ?? []).map(item => ({
    currencyId: item.currencyId,
    currencyCode:
      item.currencySnapshot?.label ?? item.currencySnapshot?.code ?? '',
    currencyName: item.currencySnapshot?.name ?? '',
    productId: item.productId,
    productCode:
      item.productSnapshot?.label ?? item.productSnapshot?.code ?? '',
    productDescription: item.productSnapshot?.name ?? '',
    quantity: item.quantity ?? '',
    per: item.per ?? '',
    rate: item.rate ?? '',
    commission: item.commission ?? '',
    commissionSnapshot: item.commissionSnapshot ?? null,
    pricingRuleSnapshot: item.pricingRuleSnapshot ?? null,
    total: '',
    roundOff: '',
    finalAmount: '',
    cardId: item.cardId ?? '',
    issuerPartyProfileId: item.issuerPartyProfileId ?? '',
    issuerPartyProfileSnapshot: item.issuerPartyProfileSnapshot ?? null,
    cardSnapshot: item.cardSnapshot ?? null,
    isReload: Boolean(item.isReload),
  })),
  additionalCharges: (transaction.additionalCharges ?? []).map(charge => ({
    accountId: charge.accountId,
    accountName:
      charge.accountSnapshot?.label ??
      charge.accountSnapshot?.name ??
      charge.accountSnapshot?.code ??
      '',
    amount: charge.amount ?? '',
    gstRate: charge.gstRate ?? '',
    gstAmount: charge.gstAmount ?? '',
    totalAmount: (() => {
      const amountValue = Number(charge.amount ?? 0);
      const gstValue = Number(charge.gstAmount ?? 0);
      const isSale = transaction.transactionType === TransactionTypeEnum.SALE;
      const signedMultiplier = isSale ? 1 : -1;
      if (!Number.isFinite(amountValue)) {
        return '';
      }
      if (!Number.isFinite(gstValue)) {
        return (amountValue * signedMultiplier).toFixed(
          PURCHASE_MONEY_DECIMALS
        );
      }
      return ((amountValue + gstValue) * signedMultiplier).toFixed(
        PURCHASE_MONEY_DECIMALS
      );
    })(),
    applyTax: Boolean(charge.applyTax),
    remarks: charge.remarks ?? '',
  })),
  paymentDetails: (transaction.payments ?? []).map(payment => ({
    settlementSource: payment.settlementSource ?? 'NORMAL',
    advanceVoucherId: payment.advanceVoucherId ?? '',
    advanceVoucherNumber: payment.advanceApplication?.voucher?.number ?? '',
    advanceAvailableAmount: payment.advanceApplication?.amount ?? payment.amount ?? '',
    paymentMethod: payment.paymentMethod,
    accountId: payment.accountId,
    accountName:
      payment.accountSnapshot?.label ??
      payment.accountSnapshot?.name ??
      payment.accountSnapshot?.code ??
      '',
    amount: payment.amount ?? '',
    chequeNumber: payment.referenceNumber ?? '',
    chequeDate: payment.referenceDate ?? '',
    branchName: payment.branchName ?? '',
    drawnOn: payment.drawnOn ?? '',
    chequePageId: payment.chequePageId ?? '',
    chequePageSnapshot: payment.chequePageSnapshot ?? null,
    remarks: payment.remarks ?? '',
  })),
  };
};

export const formatPurchaseEntityLabel = (
  code?: string | null,
  name?: string | null
) => {
  const normalizedCode = code?.trim();
  const normalizedName = name?.trim();

  if (normalizedCode && normalizedName) {
    return `${normalizedCode} - ${normalizedName}`;
  }

  return normalizedCode || normalizedName || '';
};

export const getPurchaseTransactionProductFilter = (
  transactionType: TransactionType
) =>
  transactionType === TransactionTypeEnum.SALE
    ? ({ bulkSelling: true } as const)
    : ({ bulkBuying: true } as const);

export const getPurchaseTransactionAccountFilter = (
  transactionType: TransactionType
) =>
  transactionType === TransactionTypeEnum.SALE
    ? ({ bulkSale: true } as const)
    : ({ bulkPurchase: true } as const);

export const getPurchaseTransactionPartyProfileFilter = (
  transactionType: TransactionType,
  purchasePageType: PurchasePageType | null = null,
  transactionPartyProfileType: string | null = null
) =>
  transactionType === TransactionTypeEnum.SALE
    ? purchasePageType === TransactionTypeProfileEnum.SALE_CORPORATE_INDIVIDUAL
      ? transactionPartyProfileType ===
        TransactionPartyProfileTypeEnum.INDIVIDUAL
        ? ({ sale: true, isIndividual: true } as const)
        : transactionPartyProfileType ===
            TransactionPartyProfileTypeEnum.CORPORATE
          ? ({ sale: true, isIndividual: false } as const)
          : ({ sale: true } as const)
      : ({ sale: true } as const)
    : purchasePageType ===
        TransactionTypeProfileEnum.PURCHASE_CORPORATE_INDIVIDUAL
      ? transactionPartyProfileType ===
        TransactionPartyProfileTypeEnum.INDIVIDUAL
        ? ({ purchase: true, isIndividual: true } as const)
        : transactionPartyProfileType ===
            TransactionPartyProfileTypeEnum.CORPORATE
          ? ({ purchase: true, isIndividual: false } as const)
          : ({ purchase: true } as const)
      : ({ purchase: true } as const);

export const getPurchaseTransactionPricingSide = (
  transactionType: TransactionType | null | undefined
): 'buy' | 'sale' =>
  transactionType === TransactionTypeEnum.SALE ? 'sale' : 'buy';

export const getPurchaseTransactionPricingSideLabel = (
  transactionType: TransactionType | null | undefined
): 'Sell' | 'Buy' =>
  transactionType === TransactionTypeEnum.SALE ? 'Sell' : 'Buy';

export const resolveAgentCommissionRule = (
  rules: IPartyProfileCommissionRule[] = [],
  currencyCode: string,
  productCode: string
) =>
  rules.find(
    rule =>
      rule.currencyCode === currencyCode && rule.productCode === productCode
  ) ?? null;

export const calculatePurchaseTransactionCommission = (
  amount?: string | null,
  quantity?: string | null,
  currencyRatePer?: string | number | null,
  rule?: IPartyProfileCommissionRule | null
) => {
  if (!amount || !rule) {
    return '';
  }

  const parsedAmount = Number(amount);
  const parsedValue = Number(rule.commissionValue);
  const parsedPer = Number(currencyRatePer ?? 1) || 1;

  if (
    !Number.isFinite(parsedAmount) ||
    !Number.isFinite(parsedValue) ||
    !Number.isFinite(parsedPer)
  ) {
    return '';
  }

  if (rule.commissionType === 'PAISA' && !quantity) {
    return '';
  }

  const commission =
    rule.commissionType === 'PERCENTAGE'
      ? (parsedAmount * parsedValue * parsedPer) / 100
      : parsedValue * (Number(quantity ?? 0) || 0);

  return commission.toFixed(PURCHASE_MONEY_DECIMALS);
};

const toMarginValue = (
  marginType?: CurrencyRateMarginType | '' | null,
  marginValue?: string | null
): ICurrencyRateMargin => ({
  marginType: marginType ?? '',
  marginValue: marginValue ?? '',
  minRate: '',
  maxRate: '',
});

export const resolvePurchaseTransactionPreview = (
  data: IPurchasePricingData,
  currencyId: string,
  productId: string
): ICurrencyRateComparisonPreview | null => {
  if (!currencyId || !productId) {
    return null;
  }

  const latestRate = getLatestRateForCurrency(
    data.latestRates ?? [],
    currencyId
  );
  if (!latestRate) {
    return null;
  }

  const pricingGroup = getCurrencyPricingGroup(
    data.currencies ?? [],
    currencyId
  );
  const productRules = data.productCurrencyRates ?? [];
  const productRule = productRules.find(
    rule => rule.currencyId === currencyId && rule.productId === productId
  );

  return buildCurrencyRateComparisonPreview({
    latestRate,
    pricingGroup,
    overrideBuy: productRule
      ? toMarginValue(
          productRule.buy.marginType ?? '',
          productRule.buy.marginValue
        )
      : EMPTY_MARGIN,
    overrideSale: productRule
      ? toMarginValue(
          productRule.sale.marginType ?? '',
          productRule.sale.marginValue
        )
      : EMPTY_MARGIN,
  });
};

export const calculateTransactionTotal = (
  quantity?: string,
  rate?: string | null,
  per?: string | number | null
) => {
  if (!quantity || !rate) {
    return '';
  }

  const qty = Number(quantity);
  const parsedRate = Number(rate);
  const parsedPer = Number(per || 1);
  if (!Number.isFinite(qty) || !Number.isFinite(parsedRate)) {
    return '';
  }

  if (!Number.isFinite(parsedPer) || parsedPer <= 0) {
    return '';
  }

  return (qty * parsedRate / parsedPer).toFixed(PURCHASE_MONEY_DECIMALS);
};

export const calculateRoundedTransactionAmount = (value?: string | null) => {
  if (!value) {
    return '';
  }

  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) {
    return '';
  }

  return Math.round(parsedValue).toFixed(PURCHASE_MONEY_DECIMALS);
};

export const calculateTransactionRoundOff = (value?: string | null) => {
  if (!value) {
    return '';
  }

  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) {
    return '';
  }

  const roundedValue = Math.round(parsedValue);
  return (roundedValue - parsedValue).toFixed(PURCHASE_MONEY_DECIMALS);
};

const toNumericTotal = (value?: string | number | null) => {
  const parsedValue = Number(value || 0);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

export const calculatePurchasePayableTotal = (
  transactions: Array<{ total?: string | null; finalAmount?: string | null }>,
  additionalCharges: Array<{
    totalAmount?: string | null;
    amount?: string | null;
  }>,
  transactionType: TransactionType = TransactionTypeEnum.PURCHASE
) => {
  const transactionTotal = transactions.reduce(
    (sum, transaction) =>
      sum + toNumericTotal(transaction.finalAmount || transaction.total),
    0
  );
  const additionalChargeTotal = additionalCharges.reduce(
    (sum, charge) => {
      const rowTotal = toNumericTotal(charge.totalAmount || charge.amount);
      return sum + (
        transactionType === TransactionTypeEnum.PURCHASE
          ? -Math.abs(rowTotal)
          : Math.abs(rowTotal)
      );
    },
    0
  );

  return (transactionTotal + additionalChargeTotal).toFixed(
    PURCHASE_MONEY_DECIMALS
  );
};
