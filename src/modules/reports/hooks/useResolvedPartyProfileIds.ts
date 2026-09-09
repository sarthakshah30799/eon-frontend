import { useCallback } from 'react';
import { partyProfileApi } from '@/api';
import type { PartyProfileType } from '@/modules/partyProfiles/types';
import type { SalePurchaseReportFilters } from './useSalePurchaseReportFilters';

export const useResolvedPartyProfileIds = (
  filters: Pick<SalePurchaseReportFilters, 'appliedFilters'>
) => {
  return useCallback(async () => {
    const selection = filters.appliedFilters?.partyProfileSelection;
    if (!selection) {
      return undefined;
    }

    if (!selection.allSelected) {
      return selection.selectedIds.length > 0
        ? selection.selectedIds
        : undefined;
    }

    const profiles = await partyProfileApi.getAllPartyProfiles(
      {
        search: filters.appliedFilters?.partyProfileSearch?.trim() || undefined,
        activeOnly: true,
      },
      filters.appliedFilters?.partyTypeCodes?.length
        ? (filters.appliedFilters.partyTypeCodes as PartyProfileType[])
        : undefined
    );

    const resolvedIds = new Set<string>();
    profiles.forEach(profile => {
      if (!selection.excludedIds.includes(profile.id)) {
        resolvedIds.add(profile.id);
      }
    });

    return [...resolvedIds];
  }, [filters.appliedFilters]);
};
