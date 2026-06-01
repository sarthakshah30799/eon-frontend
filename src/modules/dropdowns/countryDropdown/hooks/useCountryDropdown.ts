import { useCallback } from 'react';
import { countryDropdownApi } from '@/api/countryDropdown';
import type { AsyncSelectResponse } from '@/components/ui';

interface UseCountryDropdownResult {
  loadOptions: (inputValue: string) => Promise<AsyncSelectResponse>;
}

export const useCountryDropdown = (): UseCountryDropdownResult => {
  const loadOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const options = await countryDropdownApi.getCountries(inputValue);

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
