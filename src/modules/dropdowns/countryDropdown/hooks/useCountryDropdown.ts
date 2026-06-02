import { useCallback } from 'react';
import { countryProfileApi } from '@/api/countryProfile';
import type { AsyncSelectResponse } from '@/components/ui';

interface UseCountryDropdownResult {
  loadOptions: (inputValue: string) => Promise<AsyncSelectResponse>;
}

export const useCountryDropdown = (): UseCountryDropdownResult => {
  const loadOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const response = await countryProfileApi.getCountryProfiles({
        page: 1,
        limit: 25,
        search: inputValue.trim() || undefined,
      });

      return {
        options: response.data.map(country => ({
          value: country.id,
          label: `${country.code} - ${country.name}`,
          countryId: country.id,
          code: country.code,
          name: country.name,
        })),
      };
    },
    []
  );

  return {
    loadOptions,
  };
};
