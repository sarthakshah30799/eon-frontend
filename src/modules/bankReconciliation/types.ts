export const BankReconciliationTransactionTypeEnum = {
  RECEIPT_PAYMENT: 'receipt-payment',
  BUYING_SELLING: 'buying-selling',
  DEPOSIT_WITHDRAWAL: 'deposit-withdrawal',
  ALL: 'all',
} as const;

export type BankReconciliationTransactionType =
  (typeof BankReconciliationTransactionTypeEnum)[keyof typeof BankReconciliationTransactionTypeEnum];

export const BankReconciliationSourceTypeEnum = {
  TRANSACTION_PAYMENT: 'TRANSACTION_PAYMENT',
  ACCOUNTING_VOUCHER: 'ACCOUNTING_VOUCHER',
} as const;

export type BankReconciliationSourceType =
  (typeof BankReconciliationSourceTypeEnum)[keyof typeof BankReconciliationSourceTypeEnum];

export const BankReconciliationSectionEnum = {
  RECEIVED_NOT_DEPOSITED: 'RECEIVED_NOT_DEPOSITED',
  ISSUED_NOT_PRESENTED: 'ISSUED_NOT_PRESENTED',
} as const;

export type BankReconciliationSection =
  (typeof BankReconciliationSectionEnum)[keyof typeof BankReconciliationSectionEnum];

export const BankReconciliationUnclearedEnum = {
  YES: 'yes',
  NO: 'no',
} as const;

export type BankReconciliationUncleared =
  (typeof BankReconciliationUnclearedEnum)[keyof typeof BankReconciliationUnclearedEnum];

export const BankReconciliationBankAllValue = 'ALL' as const;

export interface IBankReconciliationQuery {
  startDate: string;
  endDate: string;
  branchId?: string;
  /** Omit / empty = all bank ledger accounts */
  bankAccountId?: string;
  passengerName?: string;
  transactionType?: BankReconciliationTransactionType;
  unclearedOnly?: boolean;
}

export interface IBankReconciliationRow {
  sourceType: BankReconciliationSourceType | string;
  sourceId: string;
  section: BankReconciliationSection | string;
  branchCode: string;
  docType: string;
  docNumber: string;
  docDate: string;
  passengerName: string;
  amount: string;
  chequeNo: string;
  chequeDate: string;
  bankCode: string;
  bankDate: string | null;
  reconciliationRemarks: string | null;
  isDishonored: boolean;
  reversalNumber: string | null;
}

export interface IBankReconciliationResponse {
  receivedNotDeposited: IBankReconciliationRow[];
  issuedNotPresented: IBankReconciliationRow[];
}

export interface IBankReconciliationClearItem {
  sourceType: BankReconciliationSourceType | string;
  sourceId: string;
  bankDate: string;
  reconciliationRemarks?: string;
  isDishonored?: boolean;
  reversalNumber?: string;
}

export interface IBankReconciliationClearPayload {
  items: IBankReconciliationClearItem[];
}

export interface IBankReconciliationClearResult {
  updated: number;
}

export interface IBankReconciliationEditableRow extends IBankReconciliationRow {
  selected: boolean;
  editBankDate: string;
  editRemarks: string;
  editDishonored: boolean;
  editReversalNumber: string;
}

export interface IBankReconciliationFilterForm {
  branchId: string;
  bankAccountId: string;
  startDate: string;
  endDate: string;
  passengerName: string;
  transactionType: BankReconciliationTransactionType;
  unclearedOnly: BankReconciliationUncleared;
}
