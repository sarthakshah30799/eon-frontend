import { useCallback } from 'react';
import { stateProfileApi } from '@/api/stateProfile';
import type { AsyncSelectResponse } from '@/components/ui';

interface UseStateDropdownResult {
  loadOptions: (inputValue: string) => Promise<AsyncSelectResponse>;
}

export const useStateDropdown = (): UseStateDropdownResult => {
  const loadOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const response = await stateProfileApi.getStateProfiles({
        page: 1,
        limit: 25,
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
    []
  );

  return {
    loadOptions,
  };
};
