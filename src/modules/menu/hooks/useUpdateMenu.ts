import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { menuApi } from '@/api';
import { MENU_TEXTS } from '../constants/menuConstants';
import type { ICreateMenu } from '@/types/menuTypes';

export const useUpdateMenu = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: ICreateMenu;
    }) => menuApi.updateMenu(id, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['menus'] });
      await queryClient.invalidateQueries({ queryKey: ['menu-tree'] });
      toast.success(MENU_TEXTS.UPDATE_SUCCESS);
    },
    onError: () => {
      toast.error(MENU_TEXTS.UPDATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitMenuUpdate: mutation.mutateAsync,
  };
};
