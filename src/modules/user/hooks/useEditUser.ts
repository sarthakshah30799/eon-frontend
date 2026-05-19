import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi, type UpdateUserRequest } from '../../../api/user/user.api';
import { toast } from 'react-hot-toast';

export const useEditUser = (id: string) => {
  const queryClient = useQueryClient();

  // Fetch user data
  const { data: user, isLoading: isLoadingUser } = useQuery({
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

  const mutation = useMutation({
    mutationFn: async (data: UpdateUserRequest) => {
      try {
        const response = await userApi.updateUser(id, data);
        if (response.error) {
          throw new Error(response.error);
        }
        toast.success('User updated successfully!');
        return response.data;
      } catch (error) {
        toast.error('Failed to update user');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    },
  });

  const handleSubmit = (data: UpdateUserRequest) => {
    mutation.mutate(data);
  };

  return {
    ...mutation,
    handleSubmit,
    isPending: mutation.isPending,
    isLoading: isLoadingUser,
    data: user,
  };
};
