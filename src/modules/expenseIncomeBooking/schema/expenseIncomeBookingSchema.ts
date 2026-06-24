import * as yup from 'yup';

export const expenseIncomeBookingSchema = yup.object({
  type: yup.string().oneOf(['EXPENSE', 'INCOME']).required('Type is required'),
  interstateTransaction: yup.boolean().default(false),
  code: yup.string().trim().required('Code is required'),
  description: yup.string().trim().nullable().default(''),
  applicableCustomer: yup.boolean().default(false),
  applicableVendor: yup.boolean().default(false),
  applicableEmployee: yup.boolean().default(false),
  applicableAgent: yup.boolean().default(false),
  applicableCardIssuer: yup.boolean().default(false),
  active: yup.boolean().default(true),
  allowRecPay: yup.boolean().default(false),
  totalGst: yup.number().typeError('Total GST must be a number').min(0, 'Total GST cannot be negative').max(100, 'Total GST cannot exceed 100%').default(0),
  tdsApplicable: yup.boolean().default(false),
  tdsValue: yup.number()
    .typeError('TDS value must be a number')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
    .when('tdsApplicable', {
      is: true,
      then: (schema) => schema.required('TDS Value is required').min(0, 'TDS Value cannot be negative').max(100, 'TDS Value cannot exceed 100%'),
      otherwise: (schema) => schema.notRequired().nullable().default(0),
    }),
  tdsAccountId: yup.string()
    .nullable()
    .trim()
    .when('tdsApplicable', {
      is: true,
      then: (schema) => schema.required('Account Profile is required'),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
  from: yup.string().nullable().default(null),
  to: yup.string().nullable().default(null)
    .when('from', {
      is: (val: any) => !!val,
      then: (schema) => schema.test('is-greater', 'To date must be equal or after From date', function(value) {
        const { from } = this.parent;
        if (!from || !value) return true;
        return new Date(value) >= new Date(from);
      }),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
});
