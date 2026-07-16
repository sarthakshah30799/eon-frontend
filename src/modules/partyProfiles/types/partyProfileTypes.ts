import type { ICategoryOption } from '@/types/categoryOptionTypes';
import type { IBranchProfile } from '@/modules/branchProfile/types/branchProfileTypes';
import type { IUserReference } from '@/api/sharedTypes';

export const PartyProfileTypeEnum = {
  CORPORATE_CLIENT: 'CORPORATE_CLIENT',
  FFMC: 'FFMC',
  RF: 'RF',
  AUTHORISED_DEALER: 'AUTHORISED_DEALER',
  RMC: 'RMC',
  FRANCHISE: 'FRANCHISE',
  AGENT: 'AGENT',
  FOREIGN_CORRESPONDENT: 'FOREIGN_CORRESPONDENT',
  FOREX_CORRESPONDENT: 'FOREX_CORRESPONDENT',
  MARKETING_EXECUTIVE: 'MARKETING_EXECUTIVE',
  CARD_ISSUER_PROFILE: 'CARD_ISSUER_PROFILE',
  MISC_PROFILE: 'MISC_PROFILE',
} as const;

export const PartyProfileCommissionTypeEnum = {
  PERCENTAGE: 'PERCENTAGE',
  PAISA: 'PAISA',
} as const;

export type PartyProfileCommissionType =
  (typeof PartyProfileCommissionTypeEnum)[keyof typeof PartyProfileCommissionTypeEnum];

export type PartyProfileType =
  (typeof PartyProfileTypeEnum)[keyof typeof PartyProfileTypeEnum];

export interface IPartyProfileCommissionRule {
  currencyCode: string;
  currencyName?: string | null;
  productCode: string;
  productDescription?: string | null;
  commissionType: PartyProfileCommissionType;
  commissionValue: string;
}

export const PartyProfileStatusEnum = {
  PENDING: 'PENDING',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
} as const;

export type PartyProfileStatus =
  (typeof PartyProfileStatusEnum)[keyof typeof PartyProfileStatusEnum];

export interface IPartyProfile {
  id: string;
  createdBy: IUserReference;
  dateOfIntro: string;
  code: string;
  name: string;
  isIndividual: boolean;
  creditLimit?: number;
  creditDays?: number;
  temporaryCreditLimit?: number;
  temporaryCreditDays?: number;
  permanentCreditLimit?: number;
  permanentCreditDays?: number;
  address1: string;
  address2?: string;
  address3?: string;
  city: string;
  pinCode: string;
  kycApprovalNumber?: string;
  kycRiskCategory?: ICategoryOption | null;
  chqTrxnLimit?: number;
  defaultHandlingCharges?: number;
  defaultAgent?: ICategoryOption | null;
  phoneNo?: string;
  blockDateFrom?: string;
  establishmentDate?: string;
  remarks?: string;
  email?: string;
  contactName?: string;
  designation?: string;
  group?: ICategoryOption | null;
  entityType?: ICategoryOption | null;
  panName?: string;
  panDob?: string;
  panNo?: string;
  marketingExecutive?: ICategoryOption | null;
  businessNature?: ICategoryOption | null;
  isTdsDeducted: boolean;
  tdsGroup?: ICategoryOption | null;
  active: boolean;
  isActive: boolean;
  printAddress: boolean;
  eefcClient: boolean;
  sale: boolean;
  purchase: boolean;
  commissionRules?: IPartyProfileCommissionRule[];
  applyTax: boolean;
  igstOnly: boolean;
  gstNo?: string;
  sgstNo?: string;
  igstNo?: string;
  gstStateId?: string;
  gstStateName?: string;
  stateId?: string;
  stateName?: string;

  branchId?: string;
  branch?: IBranchProfile | null;
  location?: ICategoryOption | null;
  webSite?: string;
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankBranchName?: string;
  cancelledChequeCopy?: string;
  ffmcRegNo?: string;
  ffmcRegDate?: string;
  divisionFactor?: number;
  type: PartyProfileType;
  status?: PartyProfileStatus;
  statusUpdatedById?: string | null;
  statusUpdatedByName?: string | null;
  statusUpdatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ICreatePartyProfile = Omit<
  IPartyProfile,
  | 'id'
  | 'createdBy'
  | 'kycRiskCategory'
  | 'defaultAgent'
  | 'gstStateName'
  | 'stateName'
  | 'branch'
  | 'group'
  | 'entityType'
  | 'marketingExecutive'
  | 'businessNature'
  | 'tdsGroup'
  | 'location'
  | 'status'
  | 'statusUpdatedById'
  | 'statusUpdatedByName'
  | 'statusUpdatedAt'
  | 'active'
  | 'isActive'
  | 'createdAt'
  | 'updatedAt'
> & {
  kycRiskCategory?: string;
  defaultAgent?: string;
  group?: string;
  entityType?: string;
  marketingExecutive?: string;
  businessNature?: string;
  tdsGroup?: string;
  location?: string;
  rejectReason?: string;
};

export type IUpdatePartyProfile = Partial<ICreatePartyProfile>;

export interface IReviewPartyProfilePayload {
  status: Exclude<PartyProfileStatus, typeof PartyProfileStatusEnum.PENDING>;
  active: boolean;
  rejectReason?: string;
}

export interface IPartyProfileListQuery {
  search?: string;
  code?: string;
  name?: string;
  active?: boolean;
  activeOnly?: boolean;
  sale?: boolean;
  purchase?: boolean;
  type?: string | string[];
  page?: number;
  limit?: number;
  branchId?: string;
  branchIds?: string[];
}

export interface IPartyProfileListResponse {
  data: IPartyProfile[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}
