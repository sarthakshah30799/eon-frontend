import { useCallback } from 'react';
import { partyProfileApi } from '@/api';
import type { PartyProfileType } from '@/modules/partyProfiles/types';
import type { SalePurchaseReportFilters } from './useSalePurchaseReportFilters';

const PAGE_SIZE = 200;

export const useResolvedPartyProfileIds = (
  filters: Pick<SalePurchaseReportFilters, 'appliedFilters'>,
) => {
  return useCallback(async () => {
    const selection = filters.appliedFilters?.partyProfileSelection;
    if (!selection) {
      return undefined;
    }

    if (!selection.allSelected) {
      return selection.selectedIds.length > 0 ? selection.selectedIds : undefined;
    }

    const resolvedIds = new Set<string>();
    let page = 1;

    while (true) {
      const response = await partyProfileApi.getPartyProfiles(
        {
          search: filters.appliedFilters?.partyProfileSearch?.trim() || undefined,
          activeOnly: true,
          page,
          limit: PAGE_SIZE,
        },
        filters.appliedFilters?.partyTypeCodes?.length
          ? (filters.appliedFilters.partyTypeCodes as PartyProfileType[])
          : undefined,
      );

      response.data.forEach(profile => {
        if (!selection.excludedIds.includes(profile.id)) {
          resolvedIds.add(profile.id);
        }
      });

      if (!response.totalPages || page >= response.totalPages) {
        break;
      }

      page += 1;
    }

    return [...resolvedIds];
  }, [filters.appliedFilters]);
};
