import { useCallback, useMemo } from 'react';
import { stateProfileApi } from '@/api/stateProfile';
import { useListStateProfiles } from '@/modules/stateProfile/hooks';
import type { AsyncSelectResponse } from '@/components/ui';
import type { StateDropdownOption } from '../types/stateDropdown.types';

interface UseStateDropdownResult {
  defaultOptions: StateDropdownOption[];
  loadOptions: (inputValue: string) => Promise<AsyncSelectResponse>;
  isLoading: boolean;
  isFetching: boolean;
}

export const useStateDropdown = (
  countryId?: string
): UseStateDropdownResult => {
  const {
    data: stateResponse,
    isLoading,
    isFetching,
  } = useListStateProfiles({
    page: 1,
    limit: 25,
    countryId: countryId || undefined,
    enabled: true,
  });

  const defaultOptions = useMemo<StateDropdownOption[]>(
    () =>
      (stateResponse?.data ?? []).map(state => ({
        value: state.id,
        label: `${state.code} - ${state.name}`,
        stateId: state.id,
        countryId: state.countryId,
        code: state.code,
        name: state.name,
      })),
    [stateResponse?.data]
  );

  const loadOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const response = await stateProfileApi.getStateProfiles({
        page: 1,
        limit: 25,
        countryId: countryId || undefined,
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
    defaultOptions,
    loadOptions,
    isLoading,
    isFetching,
  };
};
