import * as yup from 'yup';

export const financialCodeSchema = yup.object({
  financialType: yup.string().trim().required('Financial Type is required'),
  financialCode: yup.string().trim().required('Financial Code is required'),
  financialName: yup.string().trim().required('Financial Name is required'),
  defaultSign: yup.string().trim().required('Default Sign is required'),
  priority: yup
    .number()
    .transform((value, originalValue) => (originalValue === '' ? 0 : value))
    .min(0, 'Priority must be at least 0')
    .integer('Priority must be an integer')
    .default(0),
  subProfiles: yup.array().of(
    yup.object({
      id: yup.string().optional(),
      financialSubCode: yup.string().trim().required('Sub Code is required'),
      financialSubName: yup.string().trim().required('Sub Name is required'),
      priority: yup
        .number()
        .transform((value, originalValue) => (originalValue === '' ? 0 : value))
        .min(0, 'Priority must be at least 0')
        .integer('Priority must be an integer')
        .default(0),
    })
  ).optional(),
});
