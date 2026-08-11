import type { IBranchProfile } from '@/modules/branchProfile/types/branchProfileTypes';

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
  per: string;
  productId: string;
  issuerPartyProfileId: string;
  feAmount: string;
  cards: CardTransferCard[];
}

export interface CardTransferFormValues {
  transferType: CardTransferType;
  sourceBranchId: string;
  sourceCounterId: string;
  destinationBranchId: string;
  transactionDate: string;
  sellTransactionNumber: string;
  purchaseTransactionNumber: string;
  remarks: string;
  items: CardTransferItem[];
}

export interface CardTransferRequest extends CardTransferFormValues {
  id: string;
  status: CardTransferStatus;
  sourceBranch?: IBranchProfile | null;
  destinationBranch?: IBranchProfile | null;
  sourceBranchName?: string;
  destinationBranchName?: string;
  sourceCounterName?: string;
  createdAt: string;
  updatedAt?: string;
  rejectionReason?: string;
}
