import { useQuery } from '@tanstack/react-query';
import { userApi } from '../../../api/user/user.api';

export const useGetUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await userApi.getUserById(id);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: !!id,
  });
};
