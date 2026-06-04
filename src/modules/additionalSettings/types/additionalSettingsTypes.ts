export interface IAdditionalSettingSubcategory {
  id: string;
  categoryId: string;
  title: string;
  code: string;
  value: string;
  categoryType: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAdditionalSettingCategory {
  id: string;
  title: string;
  code: string;
  subcategories: IAdditionalSettingSubcategory[];
  createdAt: string;
  updatedAt: string;
}

export interface IAdditionalSettingSubcategoryFormValues {
  title: string;
  code: string;
  value: string;
  categoryType: string;
}

export interface IAdditionalSettingCategoryFormValues {
  title: string;
  code: string;
  subcategories: IAdditionalSettingSubcategoryFormValues[];
}
