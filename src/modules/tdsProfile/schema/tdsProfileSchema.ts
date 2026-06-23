import * as yup from 'yup';

const optionalDateString = yup.string().trim().optional().nullable();

export const tdsProfileSchema = yup.object({
  code: yup
    .string()
    .trim()
    .required('Code is required')
    .max(50, 'Code must be at most 50 characters'),
  name: yup
    .string()
    .trim()
    .required('Name is required')
    .max(150, 'Name must be at most 150 characters'),
  description: yup.string().trim().optional().nullable().max(500),
  active: yup.boolean().default(true),
  sortOrder: yup
    .number()
    .typeError('Sort Order must be a number')
    .integer('Sort Order must be an integer')
    .min(0, 'Sort Order cannot be negative')
    .required('Sort Order is required'),
  from: optionalDateString,
  to: optionalDateString.test(
    'date-range-order',
    '"To" date must be the same as or later than "From" date',
    function (value) {
      const from = this.parent.from as string | undefined | null;
      if (!from || !value) {
        return true;
      }

      const fromDate = new Date(from);
      const toDate = new Date(value);
      if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
        return true;
      }

      return fromDate.getTime() <= toDate.getTime();
    }
  ),
  value: yup
    .number()
    .typeError('Value must be a number')
    .required('Value is required')
    .min(0, 'Value cannot be negative'),
});
