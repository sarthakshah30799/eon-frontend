import {
  BankReconciliationBankAllValue,
  BankReconciliationTransactionTypeEnum,
  BankReconciliationUnclearedEnum,
} from './types';

export const BANK_RECONCILIATION_QUERY_KEYS = {
  all: ['bank-reconciliation'] as const,
  list: (params?: unknown) =>
    [...BANK_RECONCILIATION_QUERY_KEYS.all, 'list', params] as const,
};

export const BANK_RECONCILIATION_TEXT = {
  TITLE: 'Bank Reconciliation',
  DESCRIPTION:
    'Clear or return uncleared bank cheques from transaction payments and accounting vouchers.',
  PROCESS: 'Process',
  SAVE: 'Save',
  RESET: 'Reset',
  EXIT: 'Exit',
  SECTION_RECEIVED: 'Less : Cheques Received but not Deposited',
  SECTION_ISSUED: 'Add : Cheques Issued but not presented',
  EMPTY: 'No cheque rows match the selected filters.',
  SELECT_BANK: 'Select bank ledger account',
  ALL_BANKS: 'All Banks',
  SELECT_BRANCH: 'Select branch',
  BANK_DATE_REQUIRED: 'Bank date is required for each selected row',
  REVERSAL_REQUIRED: 'Reversal number is required when Dishonor is checked',
  SELECT_REQUIRED: 'Select at least one row to save',
  SUCCESS_SAVED: 'Bank reconciliation saved successfully',
  SAVE_FAILED: 'Failed to save bank reconciliation',
  PROCESS_FAILED: 'Failed to load bank reconciliation rows',
  COL_SELECT: 'Select',
  COL_BRANCH: 'Branch',
  COL_TYPE: 'Type',
  COL_DOC_NO: 'Doc No',
  COL_DOC_DATE: 'Doc Date',
  COL_PASSENGER: 'Passenger / Party',
  COL_AMOUNT: 'Amount',
  COL_CHEQUE_NO: 'Cheque No',
  COL_CHEQUE_DATE: 'Cheque Date',
  COL_BANK: 'Bank',
  COL_BANK_DATE: 'Bank Date',
  COL_NARRATION: 'Narration',
  COL_DISHONOR: 'Dishonor',
  COL_REVERSAL: 'Reversal Number',
  FILTER_BRANCH: 'Branch',
  FILTER_BANK: 'Bank',
  FILTER_FROM: 'From Date',
  FILTER_TO: 'To Date',
  FILTER_PASSENGER: 'Passenger Name',
  FILTER_TXN_TYPE: 'Transaction Type',
  FILTER_UNCLEARED: 'Uncleared Cheques',
};

export const BANK_RECONCILIATION_TXN_TYPE_OPTIONS = [
  {
    value: BankReconciliationTransactionTypeEnum.RECEIPT_PAYMENT,
    label: 'Rcpt/Pmnt',
  },
  {
    value: BankReconciliationTransactionTypeEnum.BUYING_SELLING,
    label: 'Buying/Selling',
  },
  {
    value: BankReconciliationTransactionTypeEnum.DEPOSIT_WITHDRAWAL,
    label: 'Depo./With',
  },
  {
    value: BankReconciliationTransactionTypeEnum.ALL,
    label: 'All',
  },
];

export const BANK_RECONCILIATION_UNCLEARED_OPTIONS = [
  { value: BankReconciliationUnclearedEnum.YES, label: 'Yes' },
  { value: BankReconciliationUnclearedEnum.NO, label: 'No' },
];

export const BANK_RECONCILIATION_ALL_BANKS_OPTION = {
  value: BankReconciliationBankAllValue,
  label: BANK_RECONCILIATION_TEXT.ALL_BANKS,
};
