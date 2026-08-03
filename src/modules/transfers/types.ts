import type { ITransactionReferenceSnapshot } from '@/modules/transactions';
import type { IBranchProfile } from '@/modules/branchProfile/types/branchProfileTypes';
import type { ICounterProfile } from '@/modules/counterProfile/types/counterProfileTypes';

export const TransferTypeEnum = {
  COUNTER: 'COUNTER',
  BRANCH: 'BRANCH',
} as const;

export type TransferType = (typeof TransferTypeEnum)[keyof typeof TransferTypeEnum];
export type TransferStatus = 'HELD' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface ITransferItem {
  id: string;
  lineNo: number;
  currencyId: string;
  currencyCode?: string;
  currencyName?: string;
  productId: string;
  productCode?: string;
  productDescription?: string;
  currencySnapshot?: ITransactionReferenceSnapshot | null;
  productSnapshot?: ITransactionReferenceSnapshot | null;
  quantity: string;
  per: string;
  rate: string;
  rateEditable: boolean;
  total: string;
  roundOff: string;
  finalAmount: string;
  commission?: string | null;
  commissionSnapshot?: Record<string, unknown> | null;
}

export interface ITransferFormItem {
  currencyId: string;
  currencyCode: string;
  currencyName: string;
  productId: string;
  productCode: string;
  productDescription: string;
  quantity: string;
  per: string;
  rate: string;
  rateEditable: boolean;
  total?: string | null | undefined;
  roundOff?: string | null | undefined;
  finalAmount?: string | null | undefined;
  commission?: string | null | undefined;
  commissionSnapshot?: Record<string, unknown> | null;
}

export interface ITransferFormValues {
  transferType: TransferType;
  number: string;
  transactionDate: string | null | undefined;
  billReference: string;
  sourceBranchId: string;
  sourceCounterId: string;
  destinationBranchId: string;
  destinationCounterId: string;
  items: ITransferFormItem[];
  rejectionReason?: string;
}

export interface ICurrencyTransfer {
  id: string;
  number: string | null;
  transferType: TransferType;
  status: TransferStatus;
  transactionDate: string | null;
  billReference: string | null;
  sourceBranchId: string;
  sourceBranch?: IBranchProfile | null;
  sourceBranchSnapshot?: ITransactionReferenceSnapshot | null;
  sourceCounterId: string;
  sourceCounter?: ICounterProfile | null;
  sourceCounterSnapshot?: ITransactionReferenceSnapshot | null;
  destinationBranchId: string;
  destinationBranch?: IBranchProfile | null;
  destinationBranchSnapshot?: ITransactionReferenceSnapshot | null;
  destinationCounterId: string;
  destinationCounter?: ICounterProfile | null;
  destinationCounterSnapshot?: ITransactionReferenceSnapshot | null;
  sourceNumberSeriesCode: string | null;
  destinationNumberSeriesCode: string | null;
  sourceTransactionId: string | null;
  sourceTransaction?: Record<string, unknown> | null;
  destinationTransactionId: string | null;
  destinationTransaction?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  items: ITransferItem[];
}
