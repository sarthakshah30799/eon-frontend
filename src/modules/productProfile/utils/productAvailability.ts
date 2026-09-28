import {
  TradeModeEnum,
  TransactionTypeEnum,
  type TradeMode,
  type TransactionType,
} from '@/modules/transactions';
import type { IProductProfileListQuery } from '../types/productProfileTypes';

export type ProductAvailabilityKind =
  | 'sale_purchase'
  | 'other_transaction'
  | 'deal_cover';

export type ProductAvailabilityContext =
  | {
      kind: 'sale_purchase';
      transactionType: TransactionType | null | undefined;
      tradeMode: TradeMode | null | undefined;
    }
  | { kind: 'other_transaction' }
  | { kind: 'deal_cover' };

export type ProductAvailabilityFlag =
  | 'availableInRetailBuying'
  | 'availableInRetailSelling'
  | 'availableInBulkBuying'
  | 'availableInBulkSelling'
  | 'availableInOtherTransaction'
  | 'availableInDealCover';

export interface IProductAvailabilityFlags {
  availableInRetailBuying?: boolean | null;
  availableInRetailSelling?: boolean | null;
  availableInBulkBuying?: boolean | null;
  availableInBulkSelling?: boolean | null;
  availableInOtherTransaction?: boolean | null;
  availableInDealCover?: boolean | null;
}

export const getProductAvailabilityFlag = (
  context: ProductAvailabilityContext
): ProductAvailabilityFlag => {
  if (context.kind === 'other_transaction') {
    return 'availableInOtherTransaction';
  }
  if (context.kind === 'deal_cover') {
    return 'availableInDealCover';
  }

  const isSale = context.transactionType === TransactionTypeEnum.SALE;
  const isRetail = context.tradeMode === TradeModeEnum.RETAIL;

  if (isSale && isRetail) return 'availableInRetailSelling';
  if (isSale) return 'availableInBulkSelling';
  if (isRetail) return 'availableInRetailBuying';
  return 'availableInBulkBuying';
};

export const getProductAvailabilityQuery = (
  context: ProductAvailabilityContext
): Pick<
  IProductProfileListQuery,
  | 'retailBuying'
  | 'retailSelling'
  | 'bulkBuying'
  | 'bulkSelling'
  | 'otherTransaction'
  | 'dealCover'
> => {
  const flag = getProductAvailabilityFlag(context);
  switch (flag) {
    case 'availableInRetailBuying':
      return { retailBuying: true };
    case 'availableInRetailSelling':
      return { retailSelling: true };
    case 'availableInBulkBuying':
      return { bulkBuying: true };
    case 'availableInBulkSelling':
      return { bulkSelling: true };
    case 'availableInOtherTransaction':
      return { otherTransaction: true };
    case 'availableInDealCover':
      return { dealCover: true };
  }
};

export const productMatchesAvailability = (
  product: IProductAvailabilityFlags,
  context: ProductAvailabilityContext
): boolean => product[getProductAvailabilityFlag(context)] === true;
