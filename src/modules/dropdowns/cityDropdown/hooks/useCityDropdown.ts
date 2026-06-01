import { useCallback } from 'react';
import { cityDropdownApi } from '@/api/cityDropdown';
import type { AsyncSelectResponse } from '@/components/ui';

interface UseCityDropdownResult {
  loadOptions: (inputValue: string) => Promise<AsyncSelectResponse>;
}

export const useCityDropdown = (): UseCityDropdownResult => {
  const loadOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const options = await cityDropdownApi.getCities(inputValue);

      return {
        options,
      };
    },
    []
  );

  return {
    loadOptions,
  };
};
