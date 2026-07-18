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
  byCash: string | null;
  byCheque: string | null;
  byCard: string | null;
  byTransfer: string | null;
  byOther: string | null;
  createdAt: string;
  updatedAt: string;
  items?: ITransactionItemEntity[];
  documents?: ITransactionDocumentEntity[];
  additionalCharges?: ITransactionAdditionalChargeEntity[];
  payments?: ITransactionPaymentEntity[];
  logs?: ITransactionLogEntity[];
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
