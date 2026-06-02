import * as yup from 'yup';

export const userRoleSchema = yup.object({
  userGroupCode: yup.string().trim().required('User Group Code is required').max(20, 'User Group Code must be at most 20 characters'),
  userGroupName: yup.string().trim().required('User Group Name is required').max(250, 'User Group Name must be at most 250 characters'),

  isAdminGrp: yup.boolean().default(false),
  isMdGroup: yup.boolean().default(false),
  isComplianceGrp: yup.boolean().default(false),
  isSrFinanceGrp: yup.boolean().default(false),
  isFinanceGrp: yup.boolean().default(false),
  isBrnMgrGrp: yup.boolean().default(false),
  isExecutiveGrp: yup.boolean().default(false),
  isCardStkGrp: yup.boolean().default(false),
  isDeliveryBoyGrp: yup.boolean().default(false),
  isCashierGrp: yup.boolean().default(false),
  isSalesMgrGrp: yup.boolean().default(false),
  isActive: yup.boolean().default(true),
  isAeonAccess: yup.boolean().default(false),
  isDelPortalAccess: yup.boolean().default(false),
  isDelAppAccess: yup.boolean().default(false),
});
