import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { menuApi } from '@/api';
import { MENU_TEXTS } from '../constants/menuConstants';
import type { ICreateMenu } from '@/types/menuTypes';

export const useCreateMenu = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ICreateMenu) => menuApi.createMenu(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['menus'] });
      await queryClient.invalidateQueries({ queryKey: ['menu-tree'] });
      toast.success(MENU_TEXTS.CREATE_SUCCESS);
    },
    onError: () => {
      toast.error(MENU_TEXTS.CREATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitMenu: mutation.mutateAsync,
  };
};
