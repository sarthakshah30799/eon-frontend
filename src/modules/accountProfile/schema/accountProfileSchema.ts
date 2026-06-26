import * as yup from 'yup';

export const accountProfileSchema = yup.object({
  divisionDept: yup.string().trim().optional(),
  accountCode: yup
    .string()
    .trim()
    .required('Account Code is required')
    .min(5, 'Account Code must be at least 5 characters')
    .max(20, 'Account Code must be at most 20 characters'),
  accountName: yup
    .string()
    .trim()
    .required('Account Name is required')
    .min(10, 'Account Name must be at least 10 characters')
    .max(250, 'Account Name must be at most 250 characters'),
  accountType: yup.string().trim().optional(),
  subLedger: yup.string().trim().optional(),
  bankNature: yup.string().trim().optional(),
  currencyId: yup.string().trim().required('Currency is required'),
  financialCodeId: yup.string().trim().required('Financial Code is required'),
  financialType: yup.string().trim().optional().nullable(),
  financialSubProfileId: yup.string().trim().optional().nullable(),
  pettyCashExpenseId: yup.string().trim().optional(),
  zeroBalanceAtEod: yup.boolean().default(false),
  branchIdToTransfer: yup.string().trim().optional().nullable(),
  mapToAccountId: yup.string().trim().optional().nullable(),
  retailSale: yup.boolean().default(false),
  retailPurchase: yup.boolean().default(false),
  bulkSale: yup.boolean().default(false),
  bulkPurchase: yup.boolean().default(false),
  expense: yup.boolean().default(false),
  receipt: yup.boolean().default(false),
  payment: yup.boolean().default(false),
  journalVoucher: yup.boolean().default(false),
  active: yup.boolean().default(true),
  cmsBank: yup.boolean().default(false),
  directRemittance: yup.boolean().default(false),
});
export default accountProfileSchema;
