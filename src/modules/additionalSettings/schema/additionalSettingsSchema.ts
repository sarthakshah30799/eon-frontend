import * as yup from 'yup';
import {
  getAdditionalSettingCategoryCodeOptions,
  getAdditionalSettingCategoryDefinition,
  getAdditionalSettingSubcategoryCodeOptions,
  isRegisteredAdditionalSettingCategoryCode,
} from '../registry/additionalSettingsRegistry';

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
    .of(
      yup.object({
        title: yup.string().trim().required('Subcategory title is required'),
        code: yup.string().trim().required('Subcategory code is required'),
        value: yup.string().trim().default(''),
        categoryType: yup.string().trim().required('Category type is required'),
      })
    )
    .default([])
    .test('registered-subcategory-codes', function (subcategories) {
      const categoryCode = String(this.parent?.code ?? '').trim();
      const categoryDefinition = getAdditionalSettingCategoryDefinition(categoryCode);

      if (!categoryCode) {
        return true;
      }

      if (!isRegisteredAdditionalSettingCategoryCode(categoryCode)) {
        return true;
      }

      const allowedCodes = new Set<string>(
        getAdditionalSettingSubcategoryCodeOptions(categoryCode).map(option => option.value)
      );

      for (const [index, subcategory] of (subcategories ?? []).entries()) {
        const code = String(subcategory?.code ?? '').trim().toUpperCase();
        if (code && !allowedCodes.has(code)) {
          return this.createError({
            path: `subcategories[${index}].code`,
            message: 'Subcategory code must be selected from the predefined list',
          });
        }

        const registryEntry = categoryDefinition?.subcategories.find(
          item => item.code === code
        );

        if (registryEntry && registryEntry.required && !String(subcategory?.value ?? '').trim()) {
          return this.createError({
            path: `subcategories[${index}].value`,
            message: 'Subcategory value is required',
          });
        }
      }

      return true;
    }),
});
