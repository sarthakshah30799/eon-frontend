import { useQuery } from '@tanstack/react-query';
import { additionalSettingsApi } from '@/api/additionalSettings';

export const usePasswordPolicy = () => {
  return useQuery({
    queryKey: ['password-policy'],
    queryFn: additionalSettingsApi.getPasswordPolicy,
    staleTime: 0,
  });
};

