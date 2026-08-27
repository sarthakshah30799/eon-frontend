import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { passengersApi } from '@/api';
import type { AsyncSelectOption, AsyncSelectResponse } from '@/components/ui';

const OTHER_DOCUMENT_TYPES_QUERY_KEY = ['passenger-other-document-types'];

export const usePassengerOtherDocumentTypes = () => {
  const query = useQuery({
    queryKey: OTHER_DOCUMENT_TYPES_QUERY_KEY,
    queryFn: () => passengersApi.getOtherDocumentTypes(),
    enabled: true,
    staleTime: 30 * 60 * 1000,
  });

  const loadOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const allOptions = query.data ?? [];

      const filteredOptions = inputValue?.trim()
        ? allOptions.filter(
            opt =>
              opt.label
                .toLowerCase()
                .includes(inputValue.trim().toLowerCase()) ||
              opt.value.toLowerCase().includes(inputValue.trim().toLowerCase())
          )
        : allOptions;

      return {
        options: filteredOptions.map(opt => ({
          value: opt.value,
          label: opt.label,
        })) as AsyncSelectOption[],
      };
    },
    [query.data]
  );

  return {
    ...query,
    loadOptions,
  };
};
