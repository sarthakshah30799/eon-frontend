import type { QueryClient } from '@tanstack/react-query';
import { PartyProfileStatusEnum } from '../types';
import type {
  IPartyProfile,
  IPartyProfileListResponse,
} from '../types/partyProfileTypes';

const isPartyProfileListResponse = (
  value: unknown
): value is IPartyProfileListResponse => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    Array.isArray((value as IPartyProfileListResponse).data)
  );
};

export const syncPartyProfileCache = (
  queryClient: QueryClient,
  updatedProfile: IPartyProfile
): void => {
  const shouldRemoveFromReviewQueue =
    updatedProfile.status !== undefined &&
    updatedProfile.status !== PartyProfileStatusEnum.PENDING;

  queryClient.setQueriesData<IPartyProfile[] | IPartyProfileListResponse>(
    { queryKey: ['party-profiles'] },
    current => {
      if (!current) {
        return current;
      }

      if (Array.isArray(current)) {
        const nextProfiles = current
          .map(profile =>
            profile.id === updatedProfile.id ? updatedProfile : profile
          )
          .filter(profile =>
            shouldRemoveFromReviewQueue ? profile.id !== updatedProfile.id : true
          );

        return nextProfiles;
      }

      if (isPartyProfileListResponse(current)) {
        return {
          ...current,
          data: current.data.map(profile =>
            profile.id === updatedProfile.id ? updatedProfile : profile
          ),
        };
      }

      return current;
    }
  );

  queryClient.setQueryData(
    ['party-profile', updatedProfile.type, updatedProfile.id],
    updatedProfile
  );
};
