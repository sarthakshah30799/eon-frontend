export interface IUserRole {
  id: string;
  code: string;
  name: string;
  isAdmin: boolean;
  isMd: boolean;
  isCompliance: boolean;
  isSrFinance: boolean;
  isFinance: boolean;
  isBrnMgr: boolean;
  isHoStaff: boolean;
  isExecutive: boolean;
  isCardStk: boolean;
  isDeliveryBoy: boolean;
  isCashier: boolean;
  isSalesMgr: boolean;
  isActive: boolean;
  isAeonAccess: boolean;
  isDelPortalAccess: boolean;
  isDelAppAccess: boolean;
  permissions?: Record<string, Record<string, boolean>>;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export type ICreateUserRole = Omit<
  IUserRole,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

export type IUpdateUserRole = Partial<ICreateUserRole>;
