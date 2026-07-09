import {
  PartyProfileTypeEnum,
  type PartyProfileType,
} from '@/modules/partyProfiles/types/partyProfileTypes';
import {
  TradeModeEnum,
  TransactionTypeEnum,
  type TradeMode,
  type TransactionType,
} from '@/modules/transactions';

export const PurchasePageTypeEnum = {
  PURCHASE_FFMC: 'PURCHASE_FFMC',
  SALE_FFMC: 'SALE_FFMC',
  PURCHASE_RMC: 'PURCHASE_RMC',
  PURCHASE_FOREX: 'PURCHASE_FOREX',
  PURCHASE_FOREIGN: 'PURCHASE_FOREIGN',
  PURCHASE_MISC: 'PURCHASE_MISC',
  PURCHASE_FRANCHISE: 'PURCHASE_FRANCHISE',
} as const;

export type PurchasePageType =
  (typeof PurchasePageTypeEnum)[keyof typeof PurchasePageTypeEnum];

const PURCHASE_PAGE_TYPE_BY_SLUG: Record<string, PurchasePageType> = {
  'ffmc-ads': PurchasePageTypeEnum.PURCHASE_FFMC,
  'sale-ffmc-ads': PurchasePageTypeEnum.SALE_FFMC,
  rmc: PurchasePageTypeEnum.PURCHASE_RMC,
  forex: PurchasePageTypeEnum.PURCHASE_FOREX,
  foreign: PurchasePageTypeEnum.PURCHASE_FOREIGN,
  misc: PurchasePageTypeEnum.PURCHASE_MISC,
  franchise: PurchasePageTypeEnum.PURCHASE_FRANCHISE,
};

const PURCHASE_PAGE_SLUG_BY_TYPE: Record<PurchasePageType, string> = {
  [PurchasePageTypeEnum.PURCHASE_FFMC]: 'ffmc-ads',
  [PurchasePageTypeEnum.SALE_FFMC]: 'ffmc-ads',
  [PurchasePageTypeEnum.PURCHASE_RMC]: 'rmc',
  [PurchasePageTypeEnum.PURCHASE_FOREX]: 'forex',
  [PurchasePageTypeEnum.PURCHASE_FOREIGN]: 'foreign',
  [PurchasePageTypeEnum.PURCHASE_MISC]: 'misc',
  [PurchasePageTypeEnum.PURCHASE_FRANCHISE]: 'franchise',
};

const PURCHASE_PAGE_CONFIG_BY_TYPE: Record<
  PurchasePageType,
  {
    title: string;
    partyProfileTypes: PartyProfileType[];
  }
> = {
  [PurchasePageTypeEnum.PURCHASE_FFMC]: {
    title: 'Purchase FFMC/Ads',
    partyProfileTypes: [
      PartyProfileTypeEnum.FFMC,
      PartyProfileTypeEnum.AUTHORISED_DEALER,
    ],
  },
  [PurchasePageTypeEnum.SALE_FFMC]: {
    title: 'Sale FFMC/Ads',
    partyProfileTypes: [
      PartyProfileTypeEnum.FFMC,
      PartyProfileTypeEnum.AUTHORISED_DEALER,
    ],
  },
  [PurchasePageTypeEnum.PURCHASE_RMC]: {
    title: 'Purchase RMC',
    partyProfileTypes: [PartyProfileTypeEnum.RMC],
  },
  [PurchasePageTypeEnum.PURCHASE_FOREX]: {
    title: 'Purchase Forex',
    partyProfileTypes: [PartyProfileTypeEnum.FOREX_CORRESPONDENT],
  },
  [PurchasePageTypeEnum.PURCHASE_FOREIGN]: {
    title: 'Purchase Foreign',
    partyProfileTypes: [PartyProfileTypeEnum.FOREIGN_CORRESPONDENT],
  },
  [PurchasePageTypeEnum.PURCHASE_MISC]: {
    title: 'Purchase Misc',
    partyProfileTypes: [PartyProfileTypeEnum.MISC_PROFILE],
  },
  [PurchasePageTypeEnum.PURCHASE_FRANCHISE]: {
    title: 'Purchase Franchise',
    partyProfileTypes: [PartyProfileTypeEnum.FRANCHISE],
  },
};

export const getPurchasePageTypeFromSlug = (
  slug?: string
): PurchasePageType | null => {
  if (!slug) {
    return null;
  }

  return PURCHASE_PAGE_TYPE_BY_SLUG[slug] ?? null;
};

export const getPurchasePageTypeFromPath = (
  pathname?: string | null,
  slug?: string
): PurchasePageType | null => {
  const normalizedPath = pathname?.trim().toLowerCase() ?? '';
  if (normalizedPath.startsWith('/sale/')) {
    const normalizedSlug = slug?.trim().toLowerCase();
    if (normalizedSlug === 'ffmc-ads' || normalizedSlug === 'sale-ffmc-ads') {
      return PurchasePageTypeEnum.SALE_FFMC;
    }
  }

  return getPurchasePageTypeFromSlug(slug);
};

export const getPurchasePageTitle = (
  pageType: PurchasePageType | null
): string => {
  if (!pageType) {
    return 'Purchase';
  }

  return PURCHASE_PAGE_CONFIG_BY_TYPE[pageType]?.title ?? 'Purchase';
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
  if (!pageType) {
    return [];
  }

  return PURCHASE_PAGE_CONFIG_BY_TYPE[pageType]?.partyProfileTypes ?? [];
};

export const getPurchaseTransactionType = (
  pageType: PurchasePageType | null
): TransactionType => {
  switch (pageType) {
    case PurchasePageTypeEnum.SALE_FFMC:
      return TransactionTypeEnum.SALE;
    case PurchasePageTypeEnum.PURCHASE_FFMC:
      return TransactionTypeEnum.PURCHASE;
    default:
      return TransactionTypeEnum.PURCHASE;
  }
};

export const getPurchaseTradeMode = (
  pageType: PurchasePageType | null
): TradeMode => {
  switch (pageType) {
    case PurchasePageTypeEnum.SALE_FFMC:
    case PurchasePageTypeEnum.PURCHASE_FFMC:
      return TradeModeEnum.BULK;
    default:
      return TradeModeEnum.BULK;
  }
};

export const getPurchasePageBasePath = (
  pageType: PurchasePageType | null
): 'purchase' | 'sale' => {
  switch (pageType) {
    case PurchasePageTypeEnum.SALE_FFMC:
      return 'sale';
    default:
      return 'purchase';
  }
};
