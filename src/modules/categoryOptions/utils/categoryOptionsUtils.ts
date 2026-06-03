import type { ICreateCategoryOption } from '@/types/categoryOptionTypes';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';

export const createEmptyCategoryOptionFormValues = (): ICreateCategoryOption => ({
  code: CategoryOptionCodeEnum.LocationType,
  value: '',
  label: '',
  sortOrder: 0,
  isActive: true,
});
