import type { PartyProfileType } from '@/modules/partyProfiles/constants';

export enum BuyFromPageType {
  FFMC_ADS = 'FFMC_ADS',
}

const BUY_FROM_PAGE_TYPE_BY_SLUG: Record<string, BuyFromPageType> = {
  'ffmc-ads': BuyFromPageType.FFMC_ADS,
};

const BUY_FROM_PAGE_SLUG_BY_TYPE: Record<BuyFromPageType, string> = {
  [BuyFromPageType.FFMC_ADS]: 'ffmc-ads',
};

export const getBuyFromPageTypeFromSlug = (
  slug?: string
): BuyFromPageType | null => {
  if (!slug) {
    return null;
  }

  return BUY_FROM_PAGE_TYPE_BY_SLUG[slug] ?? null;
};

export const getBuyFromPageTitle = (
  pageType: BuyFromPageType | null
): string => {
  switch (pageType) {
    case BuyFromPageType.FFMC_ADS:
      return 'Buy From FFMC/Ads';
    default:
      return 'Buy From';
  }
};

export const getBuyFromPageCreateTitle = (
  pageType: BuyFromPageType | null
): string => {
  const pageTitle = getBuyFromPageTitle(pageType);

  return pageTitle.startsWith('Buy From')
    ? `Create ${pageTitle}`
    : 'Create Buy From';
};

export const getBuyFromPageSlugFromType = (
  pageType: BuyFromPageType | null
): string | null => {
  if (!pageType) {
    return null;
  }

  return BUY_FROM_PAGE_SLUG_BY_TYPE[pageType] ?? null;
};

export const getBuyFromPartyProfileTypes = (
  pageType: BuyFromPageType | null
): PartyProfileType[] => {
  switch (pageType) {
    case BuyFromPageType.FFMC_ADS:
      return ['FFMC', 'AUTHORISED_DEALER'];
    default:
      return [];
  }
};
