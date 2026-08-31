import { useCallback, useMemo } from 'react';
import { stateProfileApi } from '@/api/stateProfile';
import { useListStateProfiles } from '@/modules/stateProfile/hooks';
import type { AsyncSelectResponse } from '@/components/ui';
import { toPageQuery } from '@/utils/paginatedList';
import type { StateDropdownOption } from '../types/stateDropdown.types';

interface UseStateDropdownResult {
  defaultOptions: StateDropdownOption[];
  loadOptions: (
    inputValue: string,
    page?: number
  ) => Promise<AsyncSelectResponse>;
  isLoading: boolean;
  isFetching: boolean;
}

const STATE_OPTION_PAGE_SIZE = 25;

export const useStateDropdown = (
  countryId?: string
): UseStateDropdownResult => {
  const {
    data: stateResponse,
    isLoading,
    isFetching,
  } = useListStateProfiles({
    limit: STATE_OPTION_PAGE_SIZE,
    offset: 0,
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
    async (inputValue: string, page = 1): Promise<AsyncSelectResponse> => {
      const response = await stateProfileApi.getStateProfiles({
        ...toPageQuery(page, STATE_OPTION_PAGE_SIZE),
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
        hasMore: response.hasMore,
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
