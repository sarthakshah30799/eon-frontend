import { toPartyProfileRouteType } from '@/modules/partyProfiles/constants';

export const buildPartyProfileDocumentsPath = (
  partyProfileType: string,
  partyProfileId: string,
) => `/party-profiles/${toPartyProfileRouteType(partyProfileType)}/documents/${partyProfileId}`;
