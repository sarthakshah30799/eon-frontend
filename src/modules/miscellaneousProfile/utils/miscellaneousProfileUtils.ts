import {
  CategoryOptionCodeEnum,
  type ICategoryOption,
  type ICreateCategoryOption,
} from '@/types/categoryOptionTypes';
import type { CategoryOptionCode } from '@/types/categoryOptionTypes';

const normalizeCategoryOptionText = (value: string): string =>
  value.trim().toUpperCase();

const normalizeCategoryOptionCode = (value: string): string =>
  value.trim().replace(/[_\s-]/g, '').toUpperCase();

export interface ICategoryOptionFormItemValues {
  id?: string;
  value: string;
  label: string;
}

export interface ICategoryOptionsFormValues {
  code: CategoryOptionCode;
  items: ICategoryOptionFormItemValues[];
  sortOrder: number;
  isActive: boolean;
}

export const createEmptyCategoryOptionsFormValues = (
  code: CategoryOptionCode = CategoryOptionCodeEnum.LocationType
): ICategoryOptionsFormValues => ({
  code,
  items: [{ value: '', label: '' }],
  sortOrder: 0,
  isActive: true,
});

export const createEmptyCategoryOptionFormValues = (): ICreateCategoryOption => ({
  code: CategoryOptionCodeEnum.LocationType,
  value: '',
  label: '',
  sortOrder: 0,
  isActive: true,
});

export const createEmptyCategoryOptionsBulkFormValues =
  createEmptyCategoryOptionsFormValues;

export const mapCategoryOptionToFormValues = (
  option: ICategoryOption
): ICategoryOptionsFormValues => ({
  code: normalizeCategoryOptionCode(option.code) as CategoryOptionCode,
  items: [
    {
      id: option.id,
      value: normalizeCategoryOptionText(option.value),
      label: normalizeCategoryOptionText(option.label),
    },
  ],
  sortOrder: option.sortOrder ?? 0,
  isActive: option.isActive ?? true,
});

export const mapCategoryOptionsToFormValues = (
  options: ICategoryOption[]
): ICategoryOptionsFormValues => {
  const [firstOption] = options;

  return {
    code: normalizeCategoryOptionCode(
      firstOption?.code ?? CategoryOptionCodeEnum.LocationType
    ) as CategoryOptionCode,
    items: options.map(option => ({
      id: option.id,
      value: normalizeCategoryOptionText(option.value),
      label: normalizeCategoryOptionText(option.label),
    })),
    sortOrder: firstOption?.sortOrder ?? 0,
    isActive: firstOption?.isActive ?? true,
  };
};

export const buildCategoryOptionPayloads = (
  values: ICategoryOptionsFormValues
): ICreateCategoryOption[] =>
  values.items
    .map(item => {
      const value = normalizeCategoryOptionText(item.value);
      const label = normalizeCategoryOptionText(item.label) || value;

      return {
        code: normalizeCategoryOptionCode(values.code) as CategoryOptionCode,
        value,
        label,
        sortOrder: values.sortOrder,
        isActive: values.isActive,
      };
    })
    .filter(item => Boolean(item.value));
