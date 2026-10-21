import type { IPaginatedResponse } from '@/types/pagination';

export const AdvanceRefundType = {
  REFUND: 'REFUND',
  KNOCK_OFF: 'KNOCK_OFF',
} as const;
export type AdvanceRefundType =
  (typeof AdvanceRefundType)[keyof typeof AdvanceRefundType];

export const AdvanceRefundStatus = {
  DRAFT: 'DRAFT',
  PENDING_HO_APPROVAL: 'PENDING_HO_APPROVAL',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type AdvanceRefundStatus =
  (typeof AdvanceRefundStatus)[keyof typeof AdvanceRefundStatus];

export const AdvanceRefundPayoutSource = {
  LOCAL_BANK: 'LOCAL_BANK',
  HO_PAYOUT: 'HO_PAYOUT',
} as const;
export type AdvanceRefundPayoutSource =
  (typeof AdvanceRefundPayoutSource)[keyof typeof AdvanceRefundPayoutSource];

export interface AdvanceRefundSnapshot {
  id?: string;
  code?: string;
  key?: string;
  name?: string;
  label?: string;
  counterName?: string;
  accountName?: string;
  accountCode?: string;
  number?: string;
  transactionDate?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface AvailableAdvanceReceipt {
  id: string;
  number: string;
  transactionDate: string;
  partyProfileId: string;
  partyProfileSnapshot?: AdvanceRefundSnapshot;
  panNumber?: string | null;
  panName?: string | null;
  panDob?: string | null;
  originalAmount: string;
  consumedBillsAmount: string;
  consumedRefundsAmount: string;
  consumedAmount: string;
  availableAmount: string;
}

export interface AvailableAdvancesParams {
  panNumber: string;
  branchId: string;
  asOnDate?: string;
  partyProfileId?: string;
  search?: string;
}

export interface AdvanceRefundItem {
  id: string;
  advanceRefundId: string;
  lineNo: number;
  receiptVoucherId: string;
  receiptVoucherSnapshot: AdvanceRefundSnapshot;
  originalReceiptAmount: string;
  consumedAmount: string;
  availableAmount: string;
  refundAmount: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdvanceRefund {
  id: string;
  number: string;
  branchId: string;
  branchSnapshot: AdvanceRefundSnapshot;
  counterId: string;
  counterSnapshot: AdvanceRefundSnapshot;
  transactionDate: string;
  asOnDate: string;
  partyProfileId: string;
  partyProfileSnapshot: AdvanceRefundSnapshot;
  panNumber: string | null;
  panName: string | null;
  panDob: string | null;
  refundType: AdvanceRefundType;
  status: AdvanceRefundStatus;
  totalRefundAmount: string;
  narration: string;
  remarkOptionId: string | null;
  remarkSnapshot: AdvanceRefundSnapshot | null;
  knockOffAccountId: string | null;
  knockOffAccountSnapshot: AdvanceRefundSnapshot | null;
  payoutSource: AdvanceRefundPayoutSource | null;
  payingBankAccountId: string | null;
  payingBankAccountSnapshot: AdvanceRefundSnapshot | null;
  paymentMethod: string | null;
  beneficiaryAccountNumber: string | null;
  beneficiaryIfscCode: string | null;
  beneficiaryName: string | null;
  bankName: string | null;
  chequeNumber: string | null;
  chequeDate: string | null;
  drawnOn: string | null;
  journalVoucherId: string | null;
  paymentVoucherId: string | null;
  adviceVoucherId: string | null;
  hoPaymentVoucherId: string | null;
  items: AdvanceRefundItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AdvanceRefundItemFormValue {
  receiptVoucherId: string;
  receiptNumber: string;
  receiptDate: string;
  originalAmount: string;
  availableAmount: string;
  refundAmount: string;
  selected: boolean;
}

export interface AdvanceRefundFormValues {
  branchId: string;
  counterId: string;
  transactionDate: string;
  asOnDate: string;
  partyTypeOptionId?: string;
  partyProfileId: string;
  panNumber: string;
  panName: string;
  panDob: string;
  refundType: AdvanceRefundType;
  narration: string;
  remarkOptionId?: string;
  knockOffAccountId?: string;
  payoutSource?: AdvanceRefundPayoutSource;
  payingBankAccountId?: string;
  paymentMethod?: string;
  beneficiaryAccountNumber?: string;
  beneficiaryIfscCode?: string;
  beneficiaryName?: string;
  bankName?: string;
  chequeNumber?: string;
  chequeDate?: string;
  drawnOn?: string;
  items: AdvanceRefundItemFormValue[];
}

export interface CreateAdvanceRefundPayload {
  branchId: string;
  counterId: string;
  transactionDate: string;
  asOnDate: string;
  partyProfileId: string;
  panNumber?: string;
  panName?: string;
  panDob?: string;
  refundType: AdvanceRefundType;
  narration: string;
  remarkOptionId?: string;
  knockOffAccountId?: string;
  payoutSource?: AdvanceRefundPayoutSource;
  payingBankAccountId?: string;
  paymentMethod?: string;
  beneficiaryAccountNumber?: string;
  beneficiaryIfscCode?: string;
  beneficiaryName?: string;
  bankName?: string;
  chequeNumber?: string;
  chequeDate?: string;
  drawnOn?: string;
  items: Array<{
    receiptVoucherId: string;
    refundAmount: string;
  }>;
}

export interface HonourAdvanceRefundPayload {
  hoPayingBankAccountId: string;
  counterId?: string;
  transactionDate?: string;
  narration?: string;
  chequeNumber?: string;
  chequeDate?: string;
  drawnOn?: string;
}

export interface AdvanceRefundListQuery {
  limit?: number;
  offset?: number;
  branchId?: string;
  partyProfileId?: string;
  refundType?: AdvanceRefundType;
  status?: AdvanceRefundStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export type AdvanceRefundListResponse = IPaginatedResponse<AdvanceRefund>;
