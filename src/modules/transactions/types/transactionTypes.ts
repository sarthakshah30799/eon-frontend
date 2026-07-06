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
  number: string;
  slug: string | null;
  branchId: string;
  branchSnapshot?: ITransactionReferenceSnapshot | null;
  partyProfileId: string;
  partyProfileSnapshot?: ITransactionReferenceSnapshot | null;
  agentProfileId: string | null;
  agentProfileSnapshot?: ITransactionReferenceSnapshot | null;
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
  createdAt: string;
  updatedAt: string;
  items?: ITransactionItemEntity[];
  documents?: ITransactionDocumentEntity[];
  additionalCharges?: ITransactionAdditionalChargeEntity[];
  payments?: ITransactionPaymentEntity[];
}

export interface ITransactionItemEntity {
  id: string;
  transactionId: string;
  lineNo: number;
  currencyId: string;
  productId: string;
  currencyRateId: string | null;
  productCurrencyRateId: string | null;
  quantity: string;
  rate: string;
  commission: string | null;
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
  referenceNumber: string | null;
  referenceDate: string | null;
  branchName: string | null;
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

export interface ICreateTransactionPaymentPayload {
  accountId: string;
  paymentMethod: TransactionPaymentMethod;
  referenceNumber?: string | null;
  referenceDate?: string | null;
  branchName?: string | null;
  chequePageId?: string | null;
  chequePageSnapshot?: Record<string, unknown> | null;
  amount: string;
  remarks?: string | null;
}

export interface ICreateTransactionPayload {
  rootTransactionId?: string | null;
  revisionNo?: number;
  number: string;
  slug: string;
  branchId: string;
  branchSnapshot?: ITransactionReferenceSnapshot | null;
  requiresApproval?: boolean;
  partyProfileId: string;
  agentProfileId?: string | null;
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
