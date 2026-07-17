import {
  PartyProfileTypeEnum,
  type PartyProfileType,
} from '@/modules/partyProfiles/types/partyProfileTypes';
import {
  TradeModeEnum,
  TransactionTypeEnum,
  TransactionTypeProfileEnum,
  type TransactionTypeProfile,
  type TradeMode,
  type TransactionType,
} from '@/modules/transactions';

export { TransactionTypeProfileEnum } from '@/modules/transactions';
export type PurchasePageType = TransactionTypeProfile;

const PURCHASE_PAGE_TYPE_BY_SLUG: Record<string, PurchasePageType> = {
  'ffmc-ads': TransactionTypeProfileEnum.PURCHASE_FFMC,
  'sale-ffmc-ads': TransactionTypeProfileEnum.SALE_FFMC,
  'sale-rmc': TransactionTypeProfileEnum.SALE_RMC,
  'sale-forex': TransactionTypeProfileEnum.SALE_FOREX,
  'sale-foreign': TransactionTypeProfileEnum.SALE_FOREIGN,
  'sale-misc': TransactionTypeProfileEnum.SALE_MISC,
  'sale-franchise': TransactionTypeProfileEnum.SALE_FRANCHISE,
  rmc: TransactionTypeProfileEnum.PURCHASE_RMC,
  forex: TransactionTypeProfileEnum.PURCHASE_FOREX,
  foreign: TransactionTypeProfileEnum.PURCHASE_FOREIGN,
  misc: TransactionTypeProfileEnum.PURCHASE_MISC,
  franchise: TransactionTypeProfileEnum.PURCHASE_FRANCHISE,
};

const PURCHASE_PAGE_SLUG_BY_TYPE: Record<PurchasePageType, string> = {
  [TransactionTypeProfileEnum.PURCHASE_FFMC]: 'ffmc-ads',
  [TransactionTypeProfileEnum.SALE_FFMC]: 'ffmc-ads',
  [TransactionTypeProfileEnum.SALE_RMC]: 'sale-rmc',
  [TransactionTypeProfileEnum.SALE_FOREX]: 'sale-forex',
  [TransactionTypeProfileEnum.SALE_FOREIGN]: 'sale-foreign',
  [TransactionTypeProfileEnum.SALE_MISC]: 'sale-misc',
  [TransactionTypeProfileEnum.SALE_FRANCHISE]: 'sale-franchise',
  [TransactionTypeProfileEnum.PURCHASE_RMC]: 'rmc',
  [TransactionTypeProfileEnum.PURCHASE_FOREX]: 'forex',
  [TransactionTypeProfileEnum.PURCHASE_FOREIGN]: 'foreign',
  [TransactionTypeProfileEnum.PURCHASE_MISC]: 'misc',
  [TransactionTypeProfileEnum.PURCHASE_FRANCHISE]: 'franchise',
};

const PURCHASE_PAGE_CONFIG_BY_TYPE: Record<
  PurchasePageType,
  {
    title: string;
    partyProfileTypes: PartyProfileType[];
  }
> = {
  [TransactionTypeProfileEnum.PURCHASE_FFMC]: {
    title: 'Purchase FFMC/Ads',
    partyProfileTypes: [
      PartyProfileTypeEnum.FFMC,
      PartyProfileTypeEnum.AUTHORISED_DEALER,
    ],
  },
  [TransactionTypeProfileEnum.SALE_FFMC]: {
    title: 'Sale FFMC/Ads',
    partyProfileTypes: [
      PartyProfileTypeEnum.FFMC,
      PartyProfileTypeEnum.AUTHORISED_DEALER,
    ],
  },
  [TransactionTypeProfileEnum.SALE_RMC]: {
    title: 'Sale RMC',
    partyProfileTypes: [PartyProfileTypeEnum.RMC],
  },
  [TransactionTypeProfileEnum.SALE_FOREX]: {
    title: 'Sale Forex',
    partyProfileTypes: [PartyProfileTypeEnum.FOREX_CORRESPONDENT],
  },
  [TransactionTypeProfileEnum.SALE_FOREIGN]: {
    title: 'Sale Foreign',
    partyProfileTypes: [PartyProfileTypeEnum.FOREIGN_CORRESPONDENT],
  },
  [TransactionTypeProfileEnum.SALE_MISC]: {
    title: 'Sale Misc',
    partyProfileTypes: [PartyProfileTypeEnum.MISC_PROFILE],
  },
  [TransactionTypeProfileEnum.SALE_FRANCHISE]: {
    title: 'Sale Franchise',
    partyProfileTypes: [PartyProfileTypeEnum.FRANCHISE],
  },
  [TransactionTypeProfileEnum.PURCHASE_RMC]: {
    title: 'Purchase RMC',
    partyProfileTypes: [PartyProfileTypeEnum.RMC],
  },
  [TransactionTypeProfileEnum.PURCHASE_FOREX]: {
    title: 'Purchase Forex',
    partyProfileTypes: [PartyProfileTypeEnum.FOREX_CORRESPONDENT],
  },
  [TransactionTypeProfileEnum.PURCHASE_FOREIGN]: {
    title: 'Purchase Foreign',
    partyProfileTypes: [PartyProfileTypeEnum.FOREIGN_CORRESPONDENT],
  },
  [TransactionTypeProfileEnum.PURCHASE_MISC]: {
    title: 'Purchase Misc',
    partyProfileTypes: [PartyProfileTypeEnum.MISC_PROFILE],
  },
  [TransactionTypeProfileEnum.PURCHASE_FRANCHISE]: {
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
      return TransactionTypeProfileEnum.SALE_FFMC;
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
    case TransactionTypeProfileEnum.SALE_FFMC:
    case TransactionTypeProfileEnum.SALE_RMC:
    case TransactionTypeProfileEnum.SALE_FOREX:
    case TransactionTypeProfileEnum.SALE_FOREIGN:
    case TransactionTypeProfileEnum.SALE_MISC:
    case TransactionTypeProfileEnum.SALE_FRANCHISE:
      return TransactionTypeEnum.SALE;
    case TransactionTypeProfileEnum.PURCHASE_FFMC:
      return TransactionTypeEnum.PURCHASE;
    default:
      return TransactionTypeEnum.PURCHASE;
  }
};

export const getPurchaseTradeMode = (
  pageType: PurchasePageType | null
): TradeMode => {
  switch (pageType) {
    case TransactionTypeProfileEnum.SALE_FFMC:
    case TransactionTypeProfileEnum.SALE_RMC:
    case TransactionTypeProfileEnum.SALE_FOREX:
    case TransactionTypeProfileEnum.SALE_FOREIGN:
    case TransactionTypeProfileEnum.SALE_MISC:
    case TransactionTypeProfileEnum.SALE_FRANCHISE:
    case TransactionTypeProfileEnum.PURCHASE_FFMC:
      return TradeModeEnum.BULK;
    default:
      return TradeModeEnum.BULK;
  }
};

export const getPurchasePageBasePath = (
  pageType: PurchasePageType | null
): 'purchase' | 'sale' => {
  switch (pageType) {
    case TransactionTypeProfileEnum.SALE_FFMC:
    case TransactionTypeProfileEnum.SALE_RMC:
    case TransactionTypeProfileEnum.SALE_FOREX:
    case TransactionTypeProfileEnum.SALE_FOREIGN:
    case TransactionTypeProfileEnum.SALE_MISC:
    case TransactionTypeProfileEnum.SALE_FRANCHISE:
      return 'sale';
    default:
      return 'purchase';
  }
};
