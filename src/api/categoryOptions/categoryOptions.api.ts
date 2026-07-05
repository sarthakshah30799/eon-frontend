import { apiClient } from '../api';
import type {
  ICategoryOption,
  ICreateCategoryOption,
  CategoryOptionCode,
} from '@/types/categoryOptionTypes';

const normalizeCode = (code: CategoryOptionCode): CategoryOptionCode =>
  code.trim() as CategoryOptionCode;

export interface IStaticCategoryOption {
  value: string;
  label: string;
}

export const categoryOptionsApi = {
  getCategoryOptions: async (search?: string): Promise<ICategoryOption[]> => {
    const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
    const res = await apiClient.get<ICategoryOption[]>(
      `/select-options/all${query}`
    );

    if (res.error) throw new Error(res.error);
    return res.data ?? [];
  },

  getCategoryOptionsByCode: async (
    code: CategoryOptionCode
  ): Promise<ICategoryOption[]> => {
    const normalizedCode = normalizeCode(code);
    if (!normalizedCode) {
      return [];
    }

    const res = await apiClient.get<ICategoryOption[]>(
      `/select-options/${encodeURIComponent(normalizedCode)}`
    );

    if (res.error) throw new Error(res.error);
    return res.data ?? [];
  },

  getStaticCategoryOptions: async (
    code: CategoryOptionCode
  ): Promise<IStaticCategoryOption[]> => {
    const normalizedCode = normalizeCode(code);
    if (!normalizedCode) {
      return [];
    }

    const res = await apiClient.get<IStaticCategoryOption[]>(
      `/select-options/static/${encodeURIComponent(normalizedCode)}`
    );

    if (res.error) throw new Error(res.error);
    return res.data ?? [];
  },

  createCategoryOption: async (
    values: ICreateCategoryOption
  ): Promise<ICategoryOption> => {
    const normalizedCode = normalizeCode(values.code);
    const payload: ICreateCategoryOption = {
      code: normalizedCode,
      value: values.value.trim(),
      label: values.label.trim(),
      sortOrder: values.sortOrder ?? 0,
      isActive: values.isActive ?? true,
    };

    const res = await apiClient.post<ICategoryOption>(
      '/select-options',
      payload
    );

    if (res.error) throw new Error(res.error);
    if (!res.data) {
      throw new Error('Failed to create category option');
    }

    return res.data;
  },

  getCategoryOptionById: async (id: string): Promise<ICategoryOption> => {
    const res = await apiClient.get<ICategoryOption>(`/select-options/item/${id}`);

    if (res.error) throw new Error(res.error);
    if (!res.data) {
      throw new Error('Failed to load category option');
    }

    return res.data;
  },

  updateCategoryOption: async (
    id: string,
    values: ICreateCategoryOption
  ): Promise<ICategoryOption> => {
    const payload: ICreateCategoryOption = {
      code: normalizeCode(values.code),
      value: values.value.trim(),
      label: values.label.trim(),
      sortOrder: values.sortOrder ?? 0,
      isActive: values.isActive ?? true,
    };

    const res = await apiClient.put<ICategoryOption>(
      `/select-options/${id}`,
      payload
    );

    if (res.error) throw new Error(res.error);
    if (!res.data) {
      throw new Error('Failed to update category option');
    }

    return res.data;
  },

  bulkUpsertCategoryOptions: async (
    values: ICreateCategoryOption[]
  ): Promise<ICategoryOption[]> => {
    const payload = values.map(option => ({
      code: normalizeCode(option.code),
      value: option.value.trim(),
      label: option.label.trim(),
      sortOrder: option.sortOrder ?? 0,
      isActive: option.isActive ?? true,
    }));

    if (payload.length === 0) {
      return [];
    }

    const res = await apiClient.post<ICategoryOption[]>(
      '/select-options/bulk-upsert',
      payload
    );

    if (res.error) throw new Error(res.error);
    return res.data ?? [];
  },
};
