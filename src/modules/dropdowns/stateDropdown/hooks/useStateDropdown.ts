import { useCallback } from 'react';
import { stateDropdownApi } from '@/api/stateDropdown';
import type { AsyncSelectResponse } from '@/components/ui';

interface UseStateDropdownResult {
  loadOptions: (inputValue: string) => Promise<AsyncSelectResponse>;
}

export const useStateDropdown = (): UseStateDropdownResult => {
  const loadOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const options = await stateDropdownApi.getStates(inputValue);

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
