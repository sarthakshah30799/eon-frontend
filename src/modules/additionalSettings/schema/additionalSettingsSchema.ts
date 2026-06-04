import * as yup from 'yup';

const subcategorySchema = yup.object({
  title: yup.string().trim().required('Subcategory title is required'),
  code: yup.string().trim().required('Subcategory code is required'),
  value: yup.string().trim().required('Subcategory value is required'),
  categoryType: yup.string().trim().required('Category type is required'),
});

export const additionalSettingsSchema = yup.object({
  title: yup.string().trim().required('Category title is required'),
  code: yup.string().trim().required('Category code is required'),
  subcategories: yup.array().of(subcategorySchema).default([]),
});
