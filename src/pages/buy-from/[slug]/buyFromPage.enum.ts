import type { PartyProfileType } from '@/modules/partyProfiles/constants';

export enum BuyFromPageType {
  FFMC_ADS = 'FFMC_ADS',
}

const BUY_FROM_PAGE_TYPE_BY_SLUG: Record<string, BuyFromPageType> = {
  'ffmc-ads': BuyFromPageType.FFMC_ADS,
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
