export const AccountProfileLedgerLabelEnum = {
  GeneralLedger: 'GENERAL LEDGER',
  BankLedger: 'BANK LEDGER',
  CashLedger: 'CASH LEDGER',
} as const;

export type AccountProfileLedgerLabel =
  (typeof AccountProfileLedgerLabelEnum)[keyof typeof AccountProfileLedgerLabelEnum];
