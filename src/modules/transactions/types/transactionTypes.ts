export const TransactionStatusEnum = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type TransactionStatus =
  (typeof TransactionStatusEnum)[keyof typeof TransactionStatusEnum];

export const TransactionTypeEnum = {
  SALE: 'SALE',
  PURCHASE: 'PURCHASE',
} as const;

export type TransactionType =
  (typeof TransactionTypeEnum)[keyof typeof TransactionTypeEnum];

export const TransactionTypeProfileEnum = {
  PURCHASE_FFMC: 'PURCHASE_FFMC',
  PURCHASE_CORPORATE: 'PURCHASE_CORPORATE',
  PURCHASE_INDIVIDUAL: 'PURCHASE_INDIVIDUAL',
  SALE_FFMC: 'SALE_FFMC',
  SALE_RMC: 'SALE_RMC',
  SALE_FOREX: 'SALE_FOREX',
  SALE_FOREIGN: 'SALE_FOREIGN',
  SALE_MISC: 'SALE_MISC',
  SALE_FRANCHISE: 'SALE_FRANCHISE',
  PURCHASE_RMC: 'PURCHASE_RMC',
  PURCHASE_FOREX: 'PURCHASE_FOREX',
  PURCHASE_FOREIGN: 'PURCHASE_FOREIGN',
  PURCHASE_MISC: 'PURCHASE_MISC',
  PURCHASE_FRANCHISE: 'PURCHASE_FRANCHISE',
} as const;

export type TransactionTypeProfile =
  (typeof TransactionTypeProfileEnum)[keyof typeof TransactionTypeProfileEnum];

export const TRANSACTION_TYPE_PROFILE_ORDER = [
  TransactionTypeProfileEnum.PURCHASE_FFMC,
  TransactionTypeProfileEnum.PURCHASE_CORPORATE,
  TransactionTypeProfileEnum.PURCHASE_INDIVIDUAL,
  TransactionTypeProfileEnum.SALE_FFMC,
  TransactionTypeProfileEnum.SALE_RMC,
  TransactionTypeProfileEnum.SALE_FOREX,
  TransactionTypeProfileEnum.SALE_FOREIGN,
  TransactionTypeProfileEnum.SALE_MISC,
  TransactionTypeProfileEnum.SALE_FRANCHISE,
  TransactionTypeProfileEnum.PURCHASE_RMC,
  TransactionTypeProfileEnum.PURCHASE_FOREX,
  TransactionTypeProfileEnum.PURCHASE_FOREIGN,
  TransactionTypeProfileEnum.PURCHASE_MISC,
  TransactionTypeProfileEnum.PURCHASE_FRANCHISE,
] as const satisfies readonly TransactionTypeProfile[];

export const TradeModeEnum = {
  BULK: 'BULK',
  RETAIL: 'RETAIL',
} as const;

export type TradeMode = (typeof TradeModeEnum)[keyof typeof TradeModeEnum];

export const TransactionDocumentStatusEnum = {
  PENDING: 'PENDING',
  ATTACHED: 'ATTACHED',
  REMOVED: 'REMOVED',
} as const;

export type TransactionDocumentStatus =
  (typeof TransactionDocumentStatusEnum)[keyof typeof TransactionDocumentStatusEnum];

export const TransactionPaymentMethodEnum = {
  CASH: 'CASH',
  CHEQUE: 'CHEQUE',
  BANK_TRANSFER: 'BANK_TRANSFER',
  UPI: 'UPI',
  NEFT: 'NEFT',
  RTGS: 'RTGS',
  IMPS: 'IMPS',
  CARD: 'CARD',
  OTHER: 'OTHER',
} as const;

export type TransactionPaymentMethod =
  (typeof TransactionPaymentMethodEnum)[keyof typeof TransactionPaymentMethodEnum];

export const TransactionPaymentDirectionEnum = {
  PAYMENT: 'PAYMENT',
  RECEIPT: 'RECEIPT',
} as const;

export type TransactionPaymentDirection =
  (typeof TransactionPaymentDirectionEnum)[keyof typeof TransactionPaymentDirectionEnum];

export const TransactionEventStatusEnum = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  PROCESSED: 'PROCESSED',
  FAILED: 'FAILED',
} as const;

export type TransactionEventStatus =
  (typeof TransactionEventStatusEnum)[keyof typeof TransactionEventStatusEnum];

export const TransactionLogActionEnum = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  SUBMIT: 'SUBMIT',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  VERSION_CREATE: 'VERSION_CREATE',
  DOCUMENT_UPDATE: 'DOCUMENT_UPDATE',
  ADDITIONAL_CHARGE_UPDATE: 'ADDITIONAL_CHARGE_UPDATE',
  PAYMENT_UPDATE: 'PAYMENT_UPDATE',
  PRINT: 'PRINT',
} as const;

export type TransactionLogAction =
  (typeof TransactionLogActionEnum)[keyof typeof TransactionLogActionEnum];

export interface ITransactionReferenceSnapshot {
  id: string;
  code?: string | null;
  name?: string | null;
  label?: string | null;
  [key: string]: unknown;
}

export interface ITransactionPricingRuleSnapshot {
  id?: string;
  source?: string | null;
  buy?: Record<string, unknown> | null;
  sale?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface ITransactionEntity {
  id: string;
  rootTransactionId: string | null;
  revisionNo: number;
  number: string | null;
  slug: string | null;
  branchId: string;
  branchSnapshot?: ITransactionReferenceSnapshot | null;
  counterId: string;
  counterSnapshot?: ITransactionReferenceSnapshot | null;
  companyId: string | null;
  companySnapshot?: ITransactionReferenceSnapshot | null;
  sacCode: string | null;
  partyProfileId: string;
  partyProfileSnapshot?: ITransactionReferenceSnapshot | null;
  purposeId: string | null;
  purposeSnapshot?: ITransactionReferenceSnapshot | null;
  agentProfileId: string | null;
  agentProfileSnapshot?: ITransactionReferenceSnapshot | null;
  passengerId: string | null;
  passengerSnapshot?: Record<string, unknown> | null;
  manualBookPageId: string | null;
  manualBookPageSnapshot?: Record<string, unknown> | null;
  transactionType: TransactionType;
  tradeMode: TradeMode;
  status: TransactionStatus;
  remarks: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  approvedById: string | null;
  rejectedById: string | null;
  approvalRemarks: string | null;
  rejectionReason: string | null;
  isLatest: boolean;
  byCash: string | null;
  byCheque: string | null;
  byCard: string | null;
  byTransfer: string | null;
  byOther: string | null;
  createdAt: string;
  updatedAt: string;
  taxRatePercent: string | null;
  taxableAmount: string;
  itemBaseAmount: string;
  itemTaxableAmount: string;
  itemTaxAmount: string;
  additionalChargeBaseAmount: string;
  additionalChargeTaxAmount: string;
  igstAmount: string;
  cgstAmount: string;
  sgstAmount: string;
  finalAmount: string;
  splitMode: 'IGST' | 'CGST_SGST' | null;
  items?: ITransactionItemEntity[];
  documents?: ITransactionDocumentEntity[];
  additionalCharges?: ITransactionAdditionalChargeEntity[];
  payments?: ITransactionPaymentEntity[];
  passengerOtherDocuments?: ITransactionPassengerOtherDocumentEntity[];
  logs?: ITransactionLogEntity[];
}

export interface ITransactionPassengerOtherDocumentEntity {
  id: string;
  transactionId: string;
  lineNo: number;
  documentType: string;
  documentNumber: string;
  validTill: string | null;
  issueAt: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  fileName: string | null;
  originalFileName: string | null;
  mimeType: string | null;
  fileSize: string | null;
  storageKey: string | null;
  storagePath: string | null;
  storageUrl: string | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ITransactionItemEntity {
  id: string;
  transactionId: string;
  lineNo: number;
  currencyId: string;
  productId: string;
  accountId: string | null;
  accountSnapshot: ITransactionReferenceSnapshot | null;
  currencyRateId: string | null;
  productCurrencyRateId: string | null;
  quantity: string;
  per: string | null;
  rate: string;
  taxableAmount: string;
  taxRatePercent: string;
  gstAmount: string;
  igstRatePercent: string;
  cgstRatePercent: string;
  sgstRatePercent: string;
  igstAmount: string;
  cgstAmount: string;
  sgstAmount: string;
  splitMode: 'IGST' | 'CGST_SGST' | null;
  commission: string | null;
  holdCost: string | null;
  profit: string | null;
  roundOff: string | null;
  currencySnapshot: ITransactionReferenceSnapshot | null;
  productSnapshot: ITransactionReferenceSnapshot | null;
  currencyRateSnapshot: ITransactionReferenceSnapshot | null;
  productCurrencyRateSnapshot: ITransactionPricingRuleSnapshot | null;
  pricingRuleSnapshot: ITransactionPricingRuleSnapshot | null;
  commissionSnapshot: ITransactionPricingRuleSnapshot | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ITransactionDocumentEntity {
  id: string;
  transactionId: string;
  lineNo: number;
  documentProfileId: string;
  documentProfileSnapshot: ITransactionReferenceSnapshot | null;
  status: TransactionDocumentStatus;
  fileName: string | null;
  originalFileName: string | null;
  mimeType: string | null;
  fileSize: string | null;
  storageKey: string | null;
  storagePath: string | null;
  storageUrl: string | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ITransactionAdditionalChargeEntity {
  id: string;
  transactionId: string;
  lineNo: number;
  accountId: string;
  accountSnapshot: ITransactionReferenceSnapshot | null;
  amount: string;
  gstRate: string | null;
  gstAmount: string | null;
  taxRatePercent: string;
  igstRatePercent: string;
  cgstRatePercent: string;
  sgstRatePercent: string;
  igstAmount: string;
  cgstAmount: string;
  sgstAmount: string;
  splitMode: 'IGST' | 'CGST_SGST' | null;
  applyTax: boolean;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ITransactionPaymentEntity {
  id: string;
  transactionId: string;
  lineNo: number;
  accountId: string;
  accountSnapshot: ITransactionReferenceSnapshot | null;
  chequePageId: string | null;
  chequePageSnapshot?: Record<string, unknown> | null;
  paymentMethod: TransactionPaymentMethod;
  paymentDirection: TransactionPaymentDirection;
  referenceNumber: string | null;
  referenceDate: string | null;
  branchName: string | null;
  drawnOn: string | null;
  amount: string;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ITransactionLogEntity {
  id: string;
  transactionId: string;
  action: TransactionLogAction;
  message: string;
  beforeSnapshot: Record<string, unknown> | null;
  afterSnapshot: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  performedById: string | null;
  performedAt: string;
}

export interface ITransactionEventEntity {
  id: string;
  transactionId: string;
  eventType: string;
  payload: Record<string, unknown>;
  status: TransactionEventStatus;
  attemptCount: number;
  availableAt: string;
  processedAt: string | null;
  errorMessage: string | null;
  lockedAt: string | null;
  lockedById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateTransactionItemPayload {
  currencyId: string;
  productId: string;
  currencyRateId?: string | null;
  productCurrencyRateId?: string | null;
  quantity: string;
  per: string;
  rate: string;
  commission?: string | null;
  commissionSnapshot?: ITransactionPricingRuleSnapshot | null;
  remarks?: string | null;
}

export interface ICreateTransactionDocumentPayload {
  documentProfileId: string;
  status?: TransactionDocumentStatus;
  remarks?: string | null;
}

export interface ICreateTransactionAdditionalChargePayload {
  accountId: string;
  amount: string;
  gstRate?: string | null;
  gstAmount?: string | null;
  applyTax?: boolean;
  remarks?: string | null;
}

export interface ITransactionTaxPreviewRequest {
  transactionType: TransactionType;
  branchId?: string | null;
  branchSnapshot?: ITransactionReferenceSnapshot | null;
  partyProfileId?: string | null;
  partyProfileSnapshot?: ITransactionReferenceSnapshot | null;
  partyProfileApplyTax?: boolean;
  taxRatePercent: string;
  items: Array<{
    quantity?: string | number | null;
    rate?: string | number | null;
  }>;
  additionalCharges: Array<{
    amount?: string | number | null;
    applyTax?: boolean | null;
  }>;
}

export interface ITransactionTaxPreviewResponse {
  taxRatePercent: string;
  taxableAmount: string;
  itemBaseAmount: string;
  itemTaxableAmount: string;
  itemTaxAmount: string;
  itemIgstAmount: string;
  itemCgstAmount: string;
  itemSgstAmount: string;
  itemIgstRatePercent: string;
  itemCgstRatePercent: string;
  itemSgstRatePercent: string;
  additionalChargeBaseAmount: string;
  additionalChargeTaxAmount: string;
  totalTaxAmount: string;
  finalAmount: string;
  igstAmount: string;
  cgstAmount: string;
  sgstAmount: string;
  splitMode: 'IGST' | 'CGST_SGST' | null;
  branchStateName: string | null;
  partyStateName: string | null;
  itemRows: Array<{
    lineNo: number;
    taxableAmount: string;
    taxRatePercent: string;
    gstAmount: string;
    igstRatePercent: string;
    cgstRatePercent: string;
    sgstRatePercent: string;
    igstAmount: string;
    cgstAmount: string;
    sgstAmount: string;
    splitMode: 'IGST' | 'CGST_SGST' | null;
  }>;
  additionalChargeRows: Array<{
    lineNo: number;
    amount: string;
    taxRatePercent?: string;
    gstRatePercent?: string;
    gstAmount: string;
    igstAmount?: string;
    cgstAmount?: string;
    sgstAmount?: string;
    igstRatePercent?: string;
    cgstRatePercent?: string;
    sgstRatePercent?: string;
    splitMode?: 'IGST' | 'CGST_SGST' | null;
    totalAmount: string;
  }>;
}

export interface ICreateTransactionPassengerOtherDocumentPayload {
  documentType: string;
  documentNumber: string;
  validTill?: string | null;
  issueAt?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  remarks?: string | null;
}

export interface ICreateTransactionPassengerPayload {
  entityType: string;
  nationalityType: string;
  residentStatus: string;
  countryId: string;
  stateId?: string | null;
  locationId?: string | null;
  city?: string | null;
  address1?: string | null;
  address2?: string | null;
  email?: string | null;
  contactNo?: string | null;
  panNumber?: string | null;
  panHolderName?: string | null;
  panDob?: string | null;
  panHolderRelationType?: string | null;
  corporatePanNumber?: string | null;
  corporatePanHolderName?: string | null;
  corporatePanDob?: string | null;
  corporatePanHolderRelationType?: string | null;
  paidByPanNumber?: string | null;
  paidByPanHolderName?: string | null;
  paidByPanDob?: string | null;
  gstNumber?: string | null;
  gstStateId?: string | null;
  passportNumber?: string | null;
  passportIssueAt?: string | null;
  passportIssueDate?: string | null;
  passportExpiryDate?: string | null;
  arrivalDate?: string | null;
  isPep?: boolean;
  otherDocuments: ICreateTransactionPassengerOtherDocumentPayload[];
}

export interface ICreateTransactionPaymentPayload {
  accountId: string;
  paymentMethod: TransactionPaymentMethod;
  paymentDirection?: TransactionPaymentDirection;
  referenceNumber?: string | null;
  referenceDate?: string | null;
  branchName?: string | null;
  drawnOn?: string | null;
  chequePageId?: string | null;
  chequePageSnapshot?: Record<string, unknown> | null;
  amount: string;
  remarks?: string | null;
}

export interface ICreateTransactionPayload {
  rootTransactionId?: string | null;
  revisionNo?: number;
  number?: string | null;
  slug: string;
  branchSnapshot?: ITransactionReferenceSnapshot | null;
  requiresApproval?: boolean;
  partyProfileId: string;
  purposeId?: string | null;
  agentProfileId?: string | null;
  passenger?: ICreateTransactionPassengerPayload | null;
  manualBookPageId?: string | null;
  manualBookPageSnapshot?: Record<string, unknown> | null;
  transactionType: TransactionType;
  tradeMode: TradeMode;
  remarks?: string | null;
  items: ICreateTransactionItemPayload[];
  documents: ICreateTransactionDocumentPayload[];
  additionalCharges: ICreateTransactionAdditionalChargePayload[];
  payments: ICreateTransactionPaymentPayload[];
}

export interface ICreateTransactionDraftPayload {
  transaction: ICreateTransactionPayload;
  attachments: Array<{
    documentProfileId: string;
    file: File;
  }>;
}

export interface IApproveTransactionPayload {
  approvalRemarks?: string | null;
}

export const TransactionPrintCopyTypeEnum = {
  CUSTOMER_COPY: 'CUSTOMER_COPY',
  DUPLICATE_COPY: 'DUPLICATE_COPY',
} as const;

export type TransactionPrintCopyType =
  (typeof TransactionPrintCopyTypeEnum)[keyof typeof TransactionPrintCopyTypeEnum];

export interface IRecordTransactionPrintPayload {
  copyType?: TransactionPrintCopyType;
  recipientEmail?: string;
  subject?: string;
  text?: string;
  html?: string;
  sendEmail?: boolean;
}

export interface ITransactionQuantityAvailability {
  branchId: string;
  currencyId: string;
  productId: string;
  purchasedQuantity: string;
  soldQuantity: string;
  availableQuantity: string;
}
