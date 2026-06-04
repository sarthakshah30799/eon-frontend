import type {
  IAdditionalSettingCategory,
  IAdditionalSettingCategoryFormValues,
} from '@/modules/additionalSettings/types';
import {
  createCategoryRecord,
  mapCategoryTitleUpdate,
  mapSubcategoryUpdate,
} from '@/modules/additionalSettings/utils';
import { ADDITIONAL_SETTINGS_STORAGE_KEY } from '@/modules/additionalSettings/constants';

const readStore = (): IAdditionalSettingCategory[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.localStorage.getItem(ADDITIONAL_SETTINGS_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as IAdditionalSettingCategory[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStore = (categories: IAdditionalSettingCategory[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    ADDITIONAL_SETTINGS_STORAGE_KEY,
    JSON.stringify(categories)
  );
};

export const additionalSettingsApi = {
  getAdditionalSettings: async (): Promise<IAdditionalSettingCategory[]> => {
    return readStore();
  },

  createAdditionalSetting: async (
    values: IAdditionalSettingCategoryFormValues
  ): Promise<IAdditionalSettingCategory> => {
    const categories = readStore();
    const record = createCategoryRecord(values);
    const nextCategories = [...categories, record];

    writeStore(nextCategories);

    return record;
  },

  updateCategoryTitle: async (
    categoryId: string,
    title: string
  ): Promise<IAdditionalSettingCategory> => {
    const categories = readStore();
    const nextCategories = categories.map(category =>
      category.id === categoryId ? mapCategoryTitleUpdate(category, title) : category
    );
    const updatedCategory =
      nextCategories.find(category => category.id === categoryId) ?? null;

    writeStore(nextCategories);

    if (!updatedCategory) {
      throw new Error('Category not found');
    }

    return updatedCategory;
  },

  updateSubcategory: async (
    categoryId: string,
    subcategoryId: string,
    values: { title: string; value: string }
  ): Promise<IAdditionalSettingCategory> => {
    const categories = readStore();
    const nextCategories = categories.map(category =>
      category.id === categoryId
        ? mapSubcategoryUpdate(category, subcategoryId, values)
        : category
    );
    const updatedCategory =
      nextCategories.find(category => category.id === categoryId) ?? null;

    writeStore(nextCategories);

    if (!updatedCategory) {
      throw new Error('Category not found');
    }

    return updatedCategory;
  },
};
