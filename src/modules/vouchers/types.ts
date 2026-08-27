export type VoucherType = 'RECEIPT' | 'PAYMENT' | 'JOURNAL';
export type VoucherDirection = 'DEBIT' | 'CREDIT';
export type VoucherAccountMode =
  | 'CASH'
  | 'BANK_CHEQUE'
  | 'PETTY_CASH'
  | 'CREDIT_CARD';

export interface VoucherSnapshot {
  id?: string;
  code?: string;
  key?: string;
  name?: string;
  label?: string;
}

export interface VoucherItem {
  id?: string;
  lineNumber?: number;
  itemTypeOptionId: string;
  itemTypeName?: string;
  itemTypeSnapshot?: VoucherSnapshot | null;
  subledgerPartyProfileId?: string | null;
  subledgerCode?: string;
  subledgerPartyProfileSnapshot?: VoucherSnapshot | null;
  accountId: string;
  accountCode?: string;
  accountName?: string;
  accountSnapshot?: VoucherSnapshot | null;
  direction: VoucherDirection;
  amount: string;
}

export interface VoucherFormValues {
  transactionDate: string;
  branchId: string;
  counterId: string;
  number: string;
  accountTypeOptionId: string;
  accountTypeName: string;
  accountMode: VoucherAccountMode | '';
  headerAccountId: string;
  headerAccountCode: string;
  headerAccountName: string;
  entityTypeOptionId: string;
  entityTypeName: string;
  partyProfileId: string;
  partyCode: string;
  panNumber: string;
  panName: string;
  panDob: string;
  partyName: string;
  chequeNumber: string;
  chequeDate: string;
  chequeBranch: string;
  drawnOn: string;
  remarkOptionId: string;
  remarkName: string;
  narration: string;
  idempotencyKey: string;
  items: VoucherItem[];
}

export interface AccountingVoucher extends Omit<
  VoucherFormValues,
  'number' | 'accountMode'
> {
  id: string;
  voucherType: VoucherType;
  number: string;
  accountMode: VoucherAccountMode | null;
  accountTypeSnapshot?: VoucherSnapshot | null;
  headerAccountSnapshot?: VoucherSnapshot | null;
  entityTypeSnapshot?: VoucherSnapshot | null;
  partyProfileSnapshot?: VoucherSnapshot | null;
  remarkSnapshot?: VoucherSnapshot | null;
  totalDebit: string;
  totalCredit: string;
  finalAmount: string;
  advanceControlAccountId?: string | null;
  advanceControlAccountSnapshot?: VoucherSnapshot | null;
  createdAt: string;
}

export interface VoucherListResponse {
  data: AccountingVoucher[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface AvailableAdvance extends AccountingVoucher {
  availableAmount: string;
}
