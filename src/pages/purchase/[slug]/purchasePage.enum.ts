import type { PartyProfileType } from '@/modules/partyProfiles/constants';
import type { TradeMode, TransactionType } from '@/modules/transactions';

export const PurchasePageTypeEnum = {
  PURCHASE_FFMC: 'PURCHASE_FFMC',
} as const;

export type PurchasePageType =
  (typeof PurchasePageTypeEnum)[keyof typeof PurchasePageTypeEnum];

const PURCHASE_PAGE_TYPE_BY_SLUG: Record<string, PurchasePageType> = {
  'ffmc-ads': PurchasePageTypeEnum.PURCHASE_FFMC,
};

const PURCHASE_PAGE_SLUG_BY_TYPE: Record<PurchasePageType, string> = {
  [PurchasePageTypeEnum.PURCHASE_FFMC]: 'ffmc-ads',
};

export const getPurchasePageTypeFromSlug = (
  slug?: string
): PurchasePageType | null => {
  if (!slug) {
    return null;
  }

  return PURCHASE_PAGE_TYPE_BY_SLUG[slug] ?? null;
};

export const getPurchasePageTitle = (
  pageType: PurchasePageType | null
): string => {
  switch (pageType) {
    case PurchasePageTypeEnum.PURCHASE_FFMC:
      return 'Purchase FFMC/Ads';
    default:
      return 'Purchase';
  }
};

export const getPurchasePageCreateTitle = (
  pageType: PurchasePageType | null
): string => {
  const pageTitle = getPurchasePageTitle(pageType);

  return pageTitle.startsWith('Purchase')
    ? `Create ${pageTitle}`
    : 'Create Purchase';
};

export const getPurchasePageSlugFromType = (
  pageType: PurchasePageType | null
): string | null => {
  if (!pageType) {
    return null;
  }

  return PURCHASE_PAGE_SLUG_BY_TYPE[pageType] ?? null;
};

export const getPurchasePartyProfileTypes = (
  pageType: PurchasePageType | null
): PartyProfileType[] => {
  switch (pageType) {
    case PurchasePageTypeEnum.PURCHASE_FFMC:
      return ['FFMC', 'AUTHORISED_DEALER'];
    default:
      return [];
  }
};

export const getPurchaseTransactionType = (
  pageType: PurchasePageType | null
): TransactionType => {
  switch (pageType) {
    case PurchasePageTypeEnum.PURCHASE_FFMC:
      return 'PURCHASE';
    default:
      return 'PURCHASE';
  }
};

export const getPurchaseTradeMode = (
  pageType: PurchasePageType | null
): TradeMode => {
  switch (pageType) {
    case PurchasePageTypeEnum.PURCHASE_FFMC:
      return 'BULK';
    default:
      return 'BULK';
  }
};
