import { useQuery } from '@tanstack/react-query';
import { additionalSettingsApi } from '@/api/additionalSettings';

export const useListAdditionalSettings = () => {
  return useQuery({
    queryKey: ['additional-settings'],
    queryFn: additionalSettingsApi.getAdditionalSettings,
  });
};
