import type {
  IAdditionalSettingCategory,
  IAdditionalSettingCategoryFormValues,
  IAdditionalSettingSubcategory,
  IAdditionalSettingSubcategoryFormValues,
} from '../types';

const createId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const createEmptyAdditionalSettingCategoryFormValues =
  (): IAdditionalSettingCategoryFormValues => ({
    title: '',
    code: '',
    subcategories: [],
  });

export const createEmptyAdditionalSettingSubcategoryFormValues =
  (): IAdditionalSettingSubcategoryFormValues => ({
    title: '',
    code: '',
    value: '',
    categoryType: '',
  });

const findSubcategoryByCode = (
  categories: IAdditionalSettingCategory[] | undefined,
  subcategoryCode: string
) => {
  const normalizedSubcategoryCode = subcategoryCode.trim().toUpperCase();

  for (const category of categories ?? []) {
    const subcategory = category.subcategories.find(
      item => item.code.trim().toUpperCase() === normalizedSubcategoryCode
    );

    if (subcategory) {
      return subcategory;
    }
  }

  return null;
};

export const mapCategoryToFormValues = (
  category: IAdditionalSettingCategory
): IAdditionalSettingCategoryFormValues => ({
  title: category.title,
  code: category.code,
  subcategories: category.subcategories.map(subcategory => ({
    title: subcategory.title,
    code: subcategory.code,
    value: subcategory.value,
    categoryType: subcategory.categoryType,
  })),
});

export const createCategoryRecord = (
  values: IAdditionalSettingCategoryFormValues
): IAdditionalSettingCategory => {
  const now = new Date().toISOString();
  const categoryId = createId();
  const subcategories = values.subcategories
    .map(subcategory => {
      const title = subcategory.title.trim();
      const code = subcategory.code.trim();
      const value = subcategory.value.trim();
      const categoryType = subcategory.categoryType.trim();

      if (!title && !code && !value && !categoryType) {
        return null;
      }

      return {
        id: createId(),
        categoryId,
        title,
        code,
        value,
        categoryType,
        createdAt: now,
        updatedAt: now,
      } satisfies IAdditionalSettingSubcategory;
    })
    .filter((item): item is IAdditionalSettingSubcategory => item !== null);

  return {
    id: categoryId,
    title: values.title.trim(),
    code: values.code.trim(),
    subcategories,
    createdAt: now,
    updatedAt: now,
  };
};

export const mapCategoryTitleUpdate = (
  category: IAdditionalSettingCategory,
  title: string
): IAdditionalSettingCategory => ({
  ...category,
  title: title.trim(),
  updatedAt: new Date().toISOString(),
});

export const mapSubcategoryUpdate = (
  category: IAdditionalSettingCategory,
  subcategoryId: string,
  values: Pick<IAdditionalSettingSubcategoryFormValues, 'title' | 'value'>
): IAdditionalSettingCategory => ({
  ...category,
  subcategories: category.subcategories.map(subcategory =>
    subcategory.id === subcategoryId
      ? {
          ...subcategory,
          title: values.title.trim(),
          value: values.value.trim(),
          updatedAt: new Date().toISOString(),
        }
      : subcategory
  ),
  updatedAt: new Date().toISOString(),
});

export const getAdditionalSettingBooleanValue = (
  categories: IAdditionalSettingCategory[] | undefined,
  categoryCode: string,
  subcategoryCode: string,
  fallback = false
): boolean => {
  const normalizedCategoryCode = categoryCode.trim().toUpperCase();
  const normalizedSubcategoryCode = subcategoryCode.trim().toUpperCase();

  const category = categories?.find(
    item => item.code.trim().toUpperCase() === normalizedCategoryCode
  );
  const subcategory =
    category?.subcategories.find(
      item => item.code.trim().toUpperCase() === normalizedSubcategoryCode
    ) ?? findSubcategoryByCode(categories, subcategoryCode);

  if (!subcategory) {
    return fallback;
  }

  const value = subcategory.value.trim().toUpperCase();
  if (!value) {
    return fallback;
  }

  return value === 'YES' || value === 'TRUE' || value === '1';
};

export const getAdditionalSettingTextValue = (
  categories: IAdditionalSettingCategory[] | undefined,
  categoryCode: string,
  subcategoryCode: string,
  fallback = ''
): string => {
  const normalizedCategoryCode = categoryCode.trim().toUpperCase();
  const normalizedSubcategoryCode = subcategoryCode.trim().toUpperCase();

  const category = categories?.find(
    item => item.code.trim().toUpperCase() === normalizedCategoryCode
  );
  const subcategory =
    category?.subcategories.find(
      item => item.code.trim().toUpperCase() === normalizedSubcategoryCode
    ) ?? findSubcategoryByCode(categories, subcategoryCode);

  if (!subcategory) {
    return fallback;
  }

  const value = subcategory.value.trim();
  return value || fallback;
};
