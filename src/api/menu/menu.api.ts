import { apiClient } from '../api';

export interface MenuRecord {
  id: string;
  name: string;
  path: string | null;
  icon: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  children?: MenuRecord[];
}

export const menuApi = {
  getMenuTree: async () => {
    return apiClient.get<MenuRecord[]>('/menus/tree');
  },
  getMenus: async () => {
    return apiClient.get<MenuRecord[]>('/menus');
  },
  getMenuById: async (id: string) => {
    return apiClient.get<MenuRecord>(`/menus/${id}`);
  },
  createMenu: async (data: Partial<MenuRecord>) => {
    return apiClient.post<MenuRecord>('/menus', data);
  },
  updateMenu: async (id: string, data: Partial<MenuRecord>) => {
    return apiClient.put<MenuRecord>(`/menus/${id}`, data);
  },
  deleteMenu: async (id: string) => {
    return apiClient.delete<{ message: string }>(`/menus/${id}`);
  },
};
