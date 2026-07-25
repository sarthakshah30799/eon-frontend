import { apiClient } from '../api';
import type {
  IAdditionalSettingCategory,
  IAdditionalSettingCategoryFormValues,
} from '@/modules/additionalSettings/types';
import type { IPasswordPolicy } from '@/modules/auth/types/authTypes';

export interface ISessionPolicy {
  allowMultipleLogin: boolean;
  idleTimeoutSeconds: number | null;
}

export const additionalSettingsApi = {
  getSessionPolicy: async (): Promise<ISessionPolicy> => {
    const res = await apiClient.get<IAdditionalSettingCategory[]>('/additional-settings');
    if (res.error) {
      throw new Error(res.error);
    }
    const categories = res.data ?? [];
    const sessionCategory = categories.find(
      c => c.code.trim().toUpperCase() === 'SESSION_POLICY'
    );
    const allowSub = sessionCategory?.subcategories.find(
      s => s.code.trim().toUpperCase() === 'ALLOW_MULTIPLE_LOGIN'
    );
    const timeoutSub = sessionCategory?.subcategories.find(
      s => s.code.trim().toUpperCase() === 'IDLE_TIMEOUT_SECONDS'
    );
    const rawValue = allowSub?.value?.trim().toUpperCase() ?? '';
    const allowMultipleLogin = rawValue === 'YES' || rawValue === 'TRUE' || rawValue === '1';
    const idleTimeoutSeconds = timeoutSub?.value
      ? Number.parseInt(timeoutSub.value.trim(), 10) || null
      : null;
    return { allowMultipleLogin, idleTimeoutSeconds };
  },

  getAdditionalSettings: async (): Promise<IAdditionalSettingCategory[]> => {
    const res = await apiClient.get<IAdditionalSettingCategory[]>('/additional-settings');
    if (res.error) {
      throw new Error(res.error);
    }
    return res.data ?? [];
  },

  getValueTypes: async (): Promise<string[]> => {
    const res = await apiClient.get<string[]>('/additional-settings/value-types');
    if (res.error) {
      throw new Error(res.error);
    }
    return res.data ?? [];
  },

  getPasswordPolicy: async (): Promise<IPasswordPolicy> => {
    const res = await apiClient.get<IPasswordPolicy>('/additional-settings/password-policy');
    if (res.error) {
      throw new Error(res.error);
    }
    if (!res.data) {
      throw new Error('Failed to load password policy');
    }
    return res.data;
  },

  createAdditionalSetting: async (
    values: IAdditionalSettingCategoryFormValues
  ): Promise<IAdditionalSettingCategory> => {
    const payload = {
      title: values.title.trim(),
      code: values.code.trim().toUpperCase(),
      subcategories: values.subcategories.map(sub => ({
        title: sub.title.trim(),
        code: sub.code.trim().toUpperCase(),
        value: sub.value.trim(),
        valueType: sub.categoryType.trim(),
      })),
    };

    const res = await apiClient.post<IAdditionalSettingCategory>(
      '/additional-settings',
      payload
    );
    if (res.error) {
      throw new Error(res.error);
    }
    if (!res.data) {
      throw new Error('Failed to create additional setting category');
    }
    return res.data;
  },

  updateAdditionalSetting: async (
    categoryId: string,
    values: IAdditionalSettingCategoryFormValues
  ): Promise<IAdditionalSettingCategory> => {
    const payload = {
      title: values.title.trim(),
      code: values.code.trim().toUpperCase(),
      subcategories: values.subcategories.map(sub => ({
        title: sub.title.trim(),
        code: sub.code.trim().toUpperCase(),
        value: sub.value.trim(),
        valueType: sub.categoryType.trim(),
      })),
    };

    const res = await apiClient.put<IAdditionalSettingCategory>(
      `/additional-settings/${categoryId}`,
      payload
    );
    if (res.error) {
      throw new Error(res.error);
    }
    if (!res.data) {
      throw new Error('Failed to update additional setting category');
    }
    return res.data;
  },

  updateCategoryTitle: async (
    categoryId: string,
    title: string
  ): Promise<IAdditionalSettingCategory> => {
    const res = await apiClient.put<IAdditionalSettingCategory>(
      `/additional-settings/${categoryId}`,
      { title: title.trim() }
    );
    if (res.error) {
      throw new Error(res.error);
    }
    if (!res.data) {
      throw new Error('Failed to update category title');
    }
    return res.data;
  },

  updateSubcategory: async (
    categoryId: string,
    subcategoryId: string,
    values: { description: string; value: string }
  ): Promise<IAdditionalSettingCategory> => {
    const res = await apiClient.put<IAdditionalSettingCategory>(
      `/additional-settings/${categoryId}/subcategories/${subcategoryId}`,
      {
        description: values.description.trim(),
        value: values.value.trim(),
      }
    );
    if (res.error) {
      throw new Error(res.error);
    }
    if (!res.data) {
      throw new Error('Failed to update subcategory');
    }
    return res.data;
  },
};
