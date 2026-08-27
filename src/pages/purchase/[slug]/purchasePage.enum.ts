import {
  PartyProfileTypeEnum,
  type PartyProfileType,
} from '@/modules/partyProfiles/types/partyProfileTypes';
import {
  PassengerEntityTypeEnum,
  type PassengerEntityType,
} from '@/modules/passengers/types/passengerTypes';
import {
  TradeModeEnum,
  TransactionTypeEnum,
  TransactionPartyProfileTypeEnum,
  TransactionTypeProfileEnum,
  type TransactionTypeProfile,
  type TransactionPartyProfileType,
  type TradeMode,
  type TransactionType,
} from '@/modules/transactions';

export { TransactionTypeProfileEnum } from '@/modules/transactions';
export type PurchasePageType = Exclude<
  TransactionTypeProfile,
  | typeof TransactionTypeProfileEnum.CARD_STOCK_RECEIPT
  | typeof TransactionTypeProfileEnum.CARD_TRANSFER_SELL
>;

const PURCHASE_PAGE_TYPE_BY_SLUG: Record<string, PurchasePageType> = {
  'ffmc-ads': TransactionTypeProfileEnum.PURCHASE_FFMC,
  'corporate-individual':
    TransactionTypeProfileEnum.PURCHASE_CORPORATE_INDIVIDUAL,
  'sale-ffmc-ads': TransactionTypeProfileEnum.SALE_FFMC,
  'sell-ffmc-ads': TransactionTypeProfileEnum.SALE_FFMC,
  'sale-rmc': TransactionTypeProfileEnum.SALE_RMC,
  'sell-rmc': TransactionTypeProfileEnum.SALE_RMC,
  'sale-forex': TransactionTypeProfileEnum.SALE_FOREX,
  'sell-forex': TransactionTypeProfileEnum.SALE_FOREX,
  'sale-foreign': TransactionTypeProfileEnum.SALE_FOREIGN,
  'sell-foreign': TransactionTypeProfileEnum.SALE_FOREIGN,
  'sale-misc': TransactionTypeProfileEnum.SALE_MISC,
  'sell-misc': TransactionTypeProfileEnum.SALE_MISC,
  'sale-franchise': TransactionTypeProfileEnum.SALE_FRANCHISE,
  'sell-franchise': TransactionTypeProfileEnum.SALE_FRANCHISE,
  rmc: TransactionTypeProfileEnum.PURCHASE_RMC,
  forex: TransactionTypeProfileEnum.PURCHASE_FOREX,
  foreign: TransactionTypeProfileEnum.PURCHASE_FOREIGN,
  misc: TransactionTypeProfileEnum.PURCHASE_MISC,
  franchise: TransactionTypeProfileEnum.PURCHASE_FRANCHISE,
};

const PURCHASE_PAGE_SLUG_BY_TYPE: Record<PurchasePageType, string> = {
  [TransactionTypeProfileEnum.FAKE_CURRENCY]: 'fake-currencies',
  [TransactionTypeProfileEnum.PURCHASE_FFMC]: 'ffmc-ads',
  [TransactionTypeProfileEnum.PURCHASE_CORPORATE_INDIVIDUAL]:
    'corporate-individual',
  [TransactionTypeProfileEnum.SALE_CORPORATE_INDIVIDUAL]:
    'corporate-individual',
  [TransactionTypeProfileEnum.SALE_FFMC]: 'ffmc-ads',
  // sell routes: stripped prefix (e.g. /sell/forex not /sell/sale-forex)
  [TransactionTypeProfileEnum.SALE_RMC]: 'rmc',
  [TransactionTypeProfileEnum.SALE_FOREX]: 'forex',
  [TransactionTypeProfileEnum.SALE_FOREIGN]: 'foreign',
  [TransactionTypeProfileEnum.SALE_MISC]: 'misc',
  [TransactionTypeProfileEnum.SALE_FRANCHISE]: 'franchise',
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
  [TransactionTypeProfileEnum.FAKE_CURRENCY]: {
    title: 'Fake Currencies',
    partyProfileTypes: [],
  },
  [TransactionTypeProfileEnum.PURCHASE_FFMC]: {
    title: 'Purchase From FFMC/Ads',
    partyProfileTypes: [
      PartyProfileTypeEnum.FFMC,
      PartyProfileTypeEnum.AUTHORISED_DEALER,
    ],
  },
  [TransactionTypeProfileEnum.PURCHASE_CORPORATE_INDIVIDUAL]: {
    title: 'Purchase From Corporate / Individual',
    partyProfileTypes: [PartyProfileTypeEnum.CORPORATE_CLIENT],
  },
  [TransactionTypeProfileEnum.SALE_CORPORATE_INDIVIDUAL]: {
    title: 'Sell To Corporate / Individual',
    partyProfileTypes: [PartyProfileTypeEnum.CORPORATE_CLIENT],
  },
  [TransactionTypeProfileEnum.SALE_FFMC]: {
    title: 'Sell To FFMC/Ads',
    partyProfileTypes: [
      PartyProfileTypeEnum.FFMC,
      PartyProfileTypeEnum.AUTHORISED_DEALER,
    ],
  },
  [TransactionTypeProfileEnum.SALE_RMC]: {
    title: 'Sell To RMC',
    partyProfileTypes: [PartyProfileTypeEnum.RMC],
  },
  [TransactionTypeProfileEnum.SALE_FOREX]: {
    title: 'Sell To Forex',
    partyProfileTypes: [PartyProfileTypeEnum.FOREX_CORRESPONDENT],
  },
  [TransactionTypeProfileEnum.SALE_FOREIGN]: {
    title: 'Sell To Foreign',
    partyProfileTypes: [PartyProfileTypeEnum.FOREIGN_CORRESPONDENT],
  },
  [TransactionTypeProfileEnum.SALE_MISC]: {
    title: 'Sell To Misc',
    partyProfileTypes: [PartyProfileTypeEnum.MISC_PROFILE],
  },
  [TransactionTypeProfileEnum.SALE_FRANCHISE]: {
    title: 'Sell To Franchise',
    partyProfileTypes: [PartyProfileTypeEnum.FRANCHISE],
  },
  [TransactionTypeProfileEnum.PURCHASE_RMC]: {
    title: 'Purchase From RMC',
    partyProfileTypes: [PartyProfileTypeEnum.RMC],
  },
  [TransactionTypeProfileEnum.PURCHASE_FOREX]: {
    title: 'Purchase From Forex',
    partyProfileTypes: [PartyProfileTypeEnum.FOREX_CORRESPONDENT],
  },
  [TransactionTypeProfileEnum.PURCHASE_FOREIGN]: {
    title: 'Purchase From Foreign',
    partyProfileTypes: [PartyProfileTypeEnum.FOREIGN_CORRESPONDENT],
  },
  [TransactionTypeProfileEnum.PURCHASE_MISC]: {
    title: 'Purchase From Misc',
    partyProfileTypes: [PartyProfileTypeEnum.MISC_PROFILE],
  },
  [TransactionTypeProfileEnum.PURCHASE_FRANCHISE]: {
    title: 'Purchase From Franchise',
    partyProfileTypes: [PartyProfileTypeEnum.FRANCHISE],
  },
};

export const getPurchasePageTypeFromSlug = (
  slug?: string
): PurchasePageType | null => {
  if (!slug) {
    return null;
  }

  const normalized = slug.trim().toLowerCase();
  const direct = PURCHASE_PAGE_TYPE_BY_SLUG[normalized];
  if (direct) {
    return direct;
  }

  // Alias: support `sell-*` as alias for `sale-*` (e.g. /sell/sell-forex)
  if (normalized.startsWith('sell-')) {
    const saleVariant = `sale-${normalized.slice(5)}`;
    return PURCHASE_PAGE_TYPE_BY_SLUG[saleVariant] ?? null;
  }

  return null;
};

export const getPurchasePageTypeFromPath = (
  pathname?: string | null,
  slug?: string
): PurchasePageType | null => {
  const normalizedPath = pathname?.trim().toLowerCase() ?? '';
  if (normalizedPath.startsWith('/sell/')) {
    const normalizedSlug = slug?.trim().toLowerCase() ?? '';
    // stripped slugs for sell routes (no sale-/sell- prefix)
    const sellStrippedMap: Record<string, PurchasePageType> = {
      'corporate-individual':
        TransactionTypeProfileEnum.SALE_CORPORATE_INDIVIDUAL,
      'ffmc-ads': TransactionTypeProfileEnum.SALE_FFMC,
      rmc: TransactionTypeProfileEnum.SALE_RMC,
      forex: TransactionTypeProfileEnum.SALE_FOREX,
      foreign: TransactionTypeProfileEnum.SALE_FOREIGN,
      misc: TransactionTypeProfileEnum.SALE_MISC,
      franchise: TransactionTypeProfileEnum.SALE_FRANCHISE,
    };
    if (sellStrippedMap[normalizedSlug]) {
      return sellStrippedMap[normalizedSlug];
    }
    // backward compat: keep prefixed variants working under /sell
    if (
      normalizedSlug === 'sale-ffmc-ads' ||
      normalizedSlug === 'sell-ffmc-ads'
    ) {
      return TransactionTypeProfileEnum.SALE_FFMC;
    }
    if (normalizedSlug === 'sale-rmc' || normalizedSlug === 'sell-rmc') {
      return TransactionTypeProfileEnum.SALE_RMC;
    }
    if (normalizedSlug === 'sale-forex' || normalizedSlug === 'sell-forex') {
      return TransactionTypeProfileEnum.SALE_FOREX;
    }
    if (
      normalizedSlug === 'sale-foreign' ||
      normalizedSlug === 'sell-foreign'
    ) {
      return TransactionTypeProfileEnum.SALE_FOREIGN;
    }
    if (normalizedSlug === 'sale-misc' || normalizedSlug === 'sell-misc') {
      return TransactionTypeProfileEnum.SALE_MISC;
    }
    if (
      normalizedSlug === 'sale-franchise' ||
      normalizedSlug === 'sell-franchise'
    ) {
      return TransactionTypeProfileEnum.SALE_FRANCHISE;
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
    case TransactionTypeProfileEnum.SALE_CORPORATE_INDIVIDUAL:
    case TransactionTypeProfileEnum.SALE_RMC:
    case TransactionTypeProfileEnum.SALE_FOREX:
    case TransactionTypeProfileEnum.SALE_FOREIGN:
    case TransactionTypeProfileEnum.SALE_MISC:
    case TransactionTypeProfileEnum.SALE_FRANCHISE:
      return TransactionTypeEnum.SALE;
    case TransactionTypeProfileEnum.PURCHASE_FFMC:
    case TransactionTypeProfileEnum.PURCHASE_CORPORATE_INDIVIDUAL:
      return TransactionTypeEnum.PURCHASE;
    default:
      return TransactionTypeEnum.PURCHASE;
  }
};

export const getPurchaseTradeMode = (
  pageType: PurchasePageType | null
): TradeMode => {
  switch (pageType) {
    case TransactionTypeProfileEnum.PURCHASE_CORPORATE_INDIVIDUAL:
    case TransactionTypeProfileEnum.SALE_CORPORATE_INDIVIDUAL:
      return TradeModeEnum.RETAIL;
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
): 'purchase' | 'sell' => {
  switch (pageType) {
    case TransactionTypeProfileEnum.SALE_CORPORATE_INDIVIDUAL:
    case TransactionTypeProfileEnum.SALE_FFMC:
    case TransactionTypeProfileEnum.SALE_RMC:
    case TransactionTypeProfileEnum.SALE_FOREX:
    case TransactionTypeProfileEnum.SALE_FOREIGN:
    case TransactionTypeProfileEnum.SALE_MISC:
    case TransactionTypeProfileEnum.SALE_FRANCHISE:
      return 'sell';
    default:
      return 'purchase';
  }
};

export const isCorporateIndividualPurchasePage = (
  pageType: PurchasePageType | null | undefined
): boolean =>
  pageType === TransactionTypeProfileEnum.PURCHASE_CORPORATE_INDIVIDUAL ||
  pageType === TransactionTypeProfileEnum.SALE_CORPORATE_INDIVIDUAL;

export const getPurchasePageEntityType = (
  pageType: PurchasePageType | null
): PassengerEntityType | null => {
  switch (pageType) {
    case TransactionTypeProfileEnum.PURCHASE_CORPORATE_INDIVIDUAL:
    case TransactionTypeProfileEnum.SALE_CORPORATE_INDIVIDUAL:
      return PassengerEntityTypeEnum.CORPORATE;
    default:
      return null;
  }
};

export const getPurchasePurposePartyProfileType = (
  pageType: PurchasePageType | null,
  transactionPartyProfileType?: TransactionPartyProfileType | null
): 'CORPORATE' | 'INDIVIDUAL' | null => {
  switch (pageType) {
    case TransactionTypeProfileEnum.PURCHASE_CORPORATE_INDIVIDUAL:
    case TransactionTypeProfileEnum.SALE_CORPORATE_INDIVIDUAL:
      if (
        transactionPartyProfileType ===
        TransactionPartyProfileTypeEnum.INDIVIDUAL
      ) {
        return 'INDIVIDUAL';
      }

      if (
        transactionPartyProfileType ===
        TransactionPartyProfileTypeEnum.CORPORATE
      ) {
        return 'CORPORATE';
      }

      return 'CORPORATE';
    default:
      return null;
  }
};
