import { apiClient } from '../api';
import type { ICreateMenu, IMenu, IUpdateMenu } from '@/types/menuTypes';

export const menuApi = {
  getMenuTree: async (includeAdmin?: boolean) => {
    const query = includeAdmin === undefined ? '' : `?includeAdmin=${includeAdmin}`;
    const res = await apiClient.get<IMenu[]>(`/menus/tree${query}`);
    if (res.error) throw new Error(res.error);
    return res;
  },
  getMenus: async (includeAdmin?: boolean) => {
    const query = includeAdmin === undefined ? '' : `?includeAdmin=${includeAdmin}`;
    const res = await apiClient.get<IMenu[]>(`/menus${query}`);
    if (res.error) throw new Error(res.error);
    return res;
  },
  getMenuById: async (id: string) => {
    const res = await apiClient.get<IMenu>(`/menus/${id}`);
    if (res.error) throw new Error(res.error);
    return res;
  },
  createMenu: async (data: ICreateMenu) => {
    const payload = {
      ...data,
      path: data.path.trim() || undefined,
      icon: data.icon.trim() || undefined,
      parentId: data.parentId || undefined,
    };

    const res = await apiClient.post<IMenu>('/menus', payload);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create menu');
    return res.data;
  },
  updateMenu: async (id: string, data: IUpdateMenu) => {
    const payload = {
      ...data,
      path:
        data.path !== undefined ? data.path.trim() || undefined : undefined,
      icon:
        data.icon !== undefined ? data.icon.trim() || undefined : undefined,
      parentId: data.parentId || undefined,
    };

    const res = await apiClient.put<IMenu>(`/menus/${id}`, payload);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to update menu');
    return res.data;
  },
  deleteMenu: async (id: string) => {
    const res = await apiClient.delete<{ message: string }>(`/menus/${id}`);
    if (res.error) throw new Error(res.error);
    return res;
  },
};
