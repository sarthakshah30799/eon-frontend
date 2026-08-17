import type { IBranchProfile } from '@/modules/branchProfile/types/branchProfileTypes';
import type { ITransactionReferenceSnapshot } from '@/modules/transactions';

export type CardTransferStatus = 'HELD' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
export type CardTransferType = 'SELL' | 'PURCHASE';

export interface CardTransferCard {
  id: string;
  series: string;
  kitNumber: string;
  maskedCardNumber: string;
  currencyCode: string;
  productCode: string;
  issuerName: string;
  denomination: string;
  amount: string;
  expirationDate: string;
}

export interface CardTransferItem {
  currencyId: string;
  currencySnapshot?: ITransactionReferenceSnapshot | null;
  per: string;
  productId: string;
  productSnapshot?: ITransactionReferenceSnapshot | null;
  issuerPartyProfileId: string;
  issuerPartyProfileSnapshot?: ITransactionReferenceSnapshot | null;
  feAmount: string;
  cards: CardTransferCard[];
}

export interface CardTransferFormValues {
  sourceBranchId: string;
  sourceBranchSnapshot?: ITransactionReferenceSnapshot | null;
  destinationBranchId: string;
  destinationBranchSnapshot?: ITransactionReferenceSnapshot | null;
  transactionDate: string;
  transactionNumber: string;
  remarks: string;
  items: CardTransferItem[];
}

export interface CardTransferRequest extends CardTransferFormValues {
  id: string;
  status: CardTransferStatus;
  sourceBranch?: IBranchProfile | null;
  destinationBranch?: IBranchProfile | null;
  createdAt: string;
  updatedAt?: string;
  rejectionReason?: string;
}
