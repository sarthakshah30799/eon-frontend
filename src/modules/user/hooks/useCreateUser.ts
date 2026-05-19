import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, type CreateUserRequest } from '../../../api/user/user.api';
import { toast } from 'react-hot-toast';

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateUserRequest) => {
      try {
        const response = await userApi.createUser(data);
        if (response.error) {
          throw new Error(response.error);
        }
        toast.success('User created successfully!');
        return response.data;
      } catch (error) {
        toast.error('Failed to create user');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleSubmit = (data: CreateUserRequest) => {
    mutation.mutate(data);
  };

  return {
    ...mutation,
    handleSubmit,
  };
};
