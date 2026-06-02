import * as yup from 'yup';

export const userRoleSchema = yup.object({
  code: yup.string().trim().required('Role Code is required').max(20, 'Role Code must be at most 20 characters'),
  name: yup.string().trim().required('Role Name is required').max(250, 'Role Name must be at most 250 characters'),

  isAdmin: yup.boolean().default(false),
  isMd: yup.boolean().default(false),
  isCompliance: yup.boolean().default(false),
  isSrFinance: yup.boolean().default(false),
  isFinance: yup.boolean().default(false),
  isBrnMgr: yup.boolean().default(false),
  isExecutive: yup.boolean().default(false),
  isCardStk: yup.boolean().default(false),
  isDeliveryBoy: yup.boolean().default(false),
  isCashier: yup.boolean().default(false),
  isSalesMgr: yup.boolean().default(false),
  isActive: yup.boolean().default(true),
  isAeonAccess: yup.boolean().default(false),
  isDelPortalAccess: yup.boolean().default(false),
  isDelAppAccess: yup.boolean().default(false),
});
