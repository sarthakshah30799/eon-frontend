import * as yup from 'yup';

export const menuSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required('Menu name is required')
    .max(250, 'Menu name must be at most 250 characters'),
  path: yup
    .string()
    .trim()
    .max(500, 'Menu path must be at most 500 characters')
    .default(''),
  icon: yup
    .string()
    .trim()
    .max(250, 'Menu icon must be at most 250 characters')
    .default(''),
  parentId: yup.string().nullable().default(null),
  sortOrder: yup
    .number()
    .typeError('Sort order must be a number')
    .integer('Sort order must be an integer')
    .min(0, 'Sort order must be zero or greater')
    .default(0),
  isActive: yup.boolean().default(true),
});
