export interface ITransactionPaymentDetailFormRow {
  settlementSource?: 'NORMAL' | 'ADVANCE';
  advanceVoucherId?: string;
  advanceVoucherNumber?: string;
  advanceAvailableAmount?: string;
  isAdvanceRemainder?: boolean;
  amountLocked?: boolean;
  paymentMethod: string;
  accountId: string;
  accountName: string;
  chequePageId?: string;
  chequePageSnapshot?: Record<string, unknown> | null;
  chequeNumber: string;
  chequeDate: string;
  branchName: string;
  drawnOn: string;
  amount: string;
  remarks?: string;
}
