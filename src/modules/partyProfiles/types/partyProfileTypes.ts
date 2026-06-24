export type PartyProfileStatus = 'pending' | 'approve' | 'reject';

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
  kycRiskCategory?: string;
  chqTrxnLimit?: number;
  defaultHandlingCharges?: number;
  defaultAgent?: string;
  phoneNo?: string;
  blockDateFrom?: string;
  establishmentDate?: string;
  remarks?: string;
  email?: string;
  contactName?: string;
  designation?: string;
  group?: string;
  entityType?: string;
  panName?: string;
  panDob?: string;
  panNo?: string;
  marketingExecutive?: string;
  businessNature?: string;
  isTdsDeducted: boolean;
  tds?: string;
  tdsGroup?: string;
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
  location?: string;
  webSite?: string;
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankBranchName?: string;
  cancelledChequeCopy?: string;
  ffmcRegNo?: string;
  ffmcRegDate?: string;
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
  | 'gstStateName'
  | 'stateName'
  | 'originBranchName'
  | 'status'
  | 'statusUpdatedById'
  | 'statusUpdatedByName'
  | 'statusUpdatedAt'
  | 'createdAt'
  | 'updatedAt'
> & {
  rejectReason?: string;
};

export type IUpdatePartyProfile = Partial<ICreatePartyProfile>;

export interface IReviewPartyProfilePayload {
  status: Exclude<PartyProfileStatus, 'pending'>;
  active: boolean;
  rejectReason?: string;
}

export interface IPartyProfileListQuery {
  search?: string;
  code?: string;
  name?: string;
  active?: boolean;
  type?: string;
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
