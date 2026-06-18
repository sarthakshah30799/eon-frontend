import * as yup from 'yup';
import {
  getAdditionalSettingCategoryCodeOptions,
  getAdditionalSettingSubcategoryCodeOptions,
  isRegisteredAdditionalSettingCategoryCode,
} from '../registry/additionalSettingsRegistry';

const subcategorySchema = yup.object({
  title: yup.string().trim().required('Subcategory title is required'),
  code: yup.string().trim().required('Subcategory code is required'),
  value: yup.string().trim().required('Subcategory value is required'),
  categoryType: yup.string().trim().required('Category type is required'),
});

const categoryCodeOptions = getAdditionalSettingCategoryCodeOptions().map(option => option.value);

export const additionalSettingsSchema = yup.object({
  title: yup.string().trim().required('Category title is required'),
  code: yup
    .string()
    .trim()
    .oneOf(
      categoryCodeOptions,
      'Category code must be selected from the predefined list'
    )
    .required('Category code is required'),
  subcategories: yup
    .array()
    .of(subcategorySchema)
    .default([])
    .test('registered-subcategory-codes', function (subcategories) {
      const categoryCode = String(this.parent?.code ?? '').trim();

      if (!categoryCode) {
        return true;
      }

      if (!isRegisteredAdditionalSettingCategoryCode(categoryCode)) {
        return true;
      }

      const allowedCodes = getAdditionalSettingSubcategoryCodeOptions(categoryCode).map(
        option => option.value
      );

      for (const [index, subcategory] of (subcategories ?? []).entries()) {
        const code = String(subcategory?.code ?? '').trim().toUpperCase();
        if (code && !allowedCodes.includes(code as never)) {
          return this.createError({
            path: `subcategories[${index}].code`,
            message: 'Subcategory code must be selected from the predefined list',
          });
        }
      }

      return true;
    }),
});
