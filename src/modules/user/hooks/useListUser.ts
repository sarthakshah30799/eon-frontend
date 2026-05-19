import { useQuery } from '@tanstack/react-query';
import { userApi } from '../../../api/user/user.api';

export const useListUser = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await userApi.getUsers();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    },
  });
};
