export interface ITransactionPaymentDetailFormRow {
  accountId: string;
  accountName: string;
  chequePageId?: string;
  chequePageSnapshot?: Record<string, unknown> | null;
  chequeNumber: string;
  chequeDate: string;
  branchName: string;
  drawnOn: string;
  amount: string;
}
