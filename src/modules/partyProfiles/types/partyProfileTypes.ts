import type { ICategoryOption } from '@/types/categoryOptionTypes';

export const PartyProfileStatusEnum = {
  PENDING: 'PENDING',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
} as const;

export type PartyProfileStatus =
  (typeof PartyProfileStatusEnum)[keyof typeof PartyProfileStatusEnum];

export interface IPartyProfile {
  id: string;
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
  tds?: string;
  tdsGroup?: ICategoryOption | null;
  active: boolean;
  isActive: boolean;
  printAddress: boolean;
  eefcClient: boolean;
  sale: boolean;
  purchase: boolean;
  applyTax: boolean;
  igstOnly: boolean;
  gstNo?: string;
  sgstNo?: string;
  igstNo?: string;
  gstStateId?: string;
  gstStateName?: string;
  stateId?: string;
  stateName?: string;

  originBranchId?: string;
  originBranchName?: string;
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
  type: string;
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
  | 'kycRiskCategory'
  | 'defaultAgent'
  | 'gstStateName'
  | 'stateName'
  | 'originBranchName'
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
  type?: string | string[];
  page?: number;
  limit?: number;
}

export interface IPartyProfileListResponse {
  data: IPartyProfile[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}
