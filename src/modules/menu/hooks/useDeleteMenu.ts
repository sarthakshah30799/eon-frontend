import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { menuApi } from '@/api';
import { MENU_TEXTS } from '../constants/menuConstants';

export const useDeleteMenu = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => menuApi.deleteMenu(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['menus'] });
      await queryClient.invalidateQueries({ queryKey: ['menu-tree'] });
      toast.success(MENU_TEXTS.DELETE_SUCCESS);
    },
    onError: () => {
      toast.error(MENU_TEXTS.DELETE_ERROR);
    },
  });

  return {
    ...mutation,
    submitMenuDelete: mutation.mutateAsync,
  };
};
