import {
  CategoryOptionCodeEnum,
  type ICategoryOption,
  type ICreateCategoryOption,
} from '@/types/categoryOptionTypes';
import type { CategoryOptionCode } from '@/types/categoryOptionTypes';

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
  code: option.code as CategoryOptionCode,
  items: [
    {
      id: option.id,
      value: option.value,
      label: option.label,
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
    code: (firstOption?.code ?? CategoryOptionCodeEnum.LocationType) as CategoryOptionCode,
    items: options.map(option => ({
      id: option.id,
      value: option.value,
      label: option.label,
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
      const value = item.value.trim();
      const label = item.label.trim() || value;

      return {
        code: values.code,
        value,
        label,
        sortOrder: values.sortOrder,
        isActive: values.isActive,
      };
    })
    .filter(item => Boolean(item.value));
