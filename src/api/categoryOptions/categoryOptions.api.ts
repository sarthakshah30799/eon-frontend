import { apiClient } from '../api';
import type {
  ICategoryOption,
  ICreateCategoryOption,
  CategoryOptionCode,
} from '@/types/categoryOptionTypes';

const normalizeCode = (code: CategoryOptionCode): CategoryOptionCode =>
  code.trim() as CategoryOptionCode;

export const categoryOptionsApi = {
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
};
