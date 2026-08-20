import type { IBranchProfile } from '@/modules/branchProfile/types/branchProfileTypes';
import type { ICompanyProfile } from '@/modules/companyProfile/types';
import type { ICurrencyProfile } from '@/modules/currencyProfile/types';
import type { IProductProfile } from '@/modules/productProfile/types';
import type { IPartyProfile } from '@/modules/partyProfiles/types';

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
  currencySnapshot?: ICurrencyProfile | null;
  per: string;
  productId: string;
  productSnapshot?: IProductProfile | null;
  issuerPartyProfileId: string;
  issuerPartyProfileSnapshot?: IPartyProfile | null;
  feAmount: string;
  cards: CardTransferCard[];
}

export interface CardTransferFormValues {
  sourceBranchId: string;
  sourceBranchSnapshot?: IBranchProfile | null;
  destinationBranchId: string;
  destinationBranchSnapshot?: IBranchProfile | null;
  companyId?: string | null;
  companySnapshot?: ICompanyProfile | null;
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
  sourcePrintCount?: number;
  destinationPrintCount?: number;
  createdAt: string;
  updatedAt?: string;
  rejectionReason?: string;
}
