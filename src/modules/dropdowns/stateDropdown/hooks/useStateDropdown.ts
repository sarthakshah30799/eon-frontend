import { useCallback } from 'react';
import { stateProfileApi } from '@/api/stateProfile';
import type { AsyncSelectResponse } from '@/components/ui';

interface UseStateDropdownResult {
  loadOptions: (inputValue: string) => Promise<AsyncSelectResponse>;
}

export const useStateDropdown = (
  countryId?: string
): UseStateDropdownResult => {
  const loadOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      if (!countryId) {
        return {
          options: [],
        };
      }

      const response = await stateProfileApi.getStateProfiles({
        page: 1,
        limit: 25,
        countryId,
        search: inputValue.trim() || undefined,
      });

      return {
        options: response.data.map(state => ({
          value: state.id,
          label: `${state.code} - ${state.name}`,
          stateId: state.id,
          countryId: state.countryId,
          code: state.code,
          name: state.name,
        })),
      };
    },
    [countryId]
  );

  return {
    loadOptions,
  };
};
