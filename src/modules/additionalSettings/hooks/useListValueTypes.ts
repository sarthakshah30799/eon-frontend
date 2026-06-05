import { useQuery } from '@tanstack/react-query';
import { additionalSettingsApi } from '@/api/additionalSettings';

export const useListValueTypes = () => {
  return useQuery({
    queryKey: ['additional-settings-value-types'],
    queryFn: additionalSettingsApi.getValueTypes,
    staleTime: Infinity, // The enums do not change frequently
  });
};
