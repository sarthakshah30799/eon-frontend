import { PartyProfileTypeEnum } from '@/modules/partyProfiles/types/partyProfileTypes';

/** Party profile types included in FLM 4 / FLM 6 (sidebar entity types except corporate/individual and non-trade). */
export const FLM_FFMC_PARTY_PROFILE_TYPES = [
  PartyProfileTypeEnum.FFMC,
  PartyProfileTypeEnum.AUTHORISED_DEALER,
  PartyProfileTypeEnum.RMC,
  PartyProfileTypeEnum.FOREX_CORRESPONDENT,
  PartyProfileTypeEnum.FOREIGN_CORRESPONDENT,
  PartyProfileTypeEnum.MISC_PROFILE,
  PartyProfileTypeEnum.FRANCHISE,
] as const;

export type FlmFfmcPartyProfileType =
  (typeof FLM_FFMC_PARTY_PROFILE_TYPES)[number];

const LEGACY_PROFILE_TYPE_ALIASES: Record<string, FlmFfmcPartyProfileType> = {
  FOREX: PartyProfileTypeEnum.FOREX_CORRESPONDENT,
  FOREIGN: PartyProfileTypeEnum.FOREIGN_CORRESPONDENT,
  MISC: PartyProfileTypeEnum.MISC_PROFILE,
};

export const normalizeFlmFfmcPartyProfileType = (
  value: string
): FlmFfmcPartyProfileType | null => {
  const normalized = String(value ?? '')
    .trim()
    .toUpperCase();
  if (!normalized) {
    return null;
  }

  const aliased = LEGACY_PROFILE_TYPE_ALIASES[normalized];
  if (aliased) {
    return aliased;
  }

  return FLM_FFMC_PARTY_PROFILE_TYPES.includes(
    normalized as FlmFfmcPartyProfileType
  )
    ? (normalized as FlmFfmcPartyProfileType)
    : null;
};

export const FLM_FFMC_PROFILE_IDS = [...FLM_FFMC_PARTY_PROFILE_TYPES];

export const isFlmFfmcPartyProfileType = (
  value: string
): value is FlmFfmcPartyProfileType =>
  Boolean(normalizeFlmFfmcPartyProfileType(value));
