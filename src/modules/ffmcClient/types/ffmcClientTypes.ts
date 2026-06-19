export interface IFfmcClient {
  id: string;
  dateOfIntro: string;
  code: string;
  name: string;
  isIndividual: boolean;
  isFfmc: boolean;
  ffmcRegNo?: string;
  ffmcRegDate?: string;
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
  originBranchId?: string;
  originBranchName?: string;
  location?: string;
  webSite?: string;
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankAddress?: string;
  cancelledChequeCopy?: string;
  createdAt: string;
  updatedAt: string;
}

export type ICreateFfmcClient = Omit<
  IFfmcClient,
  | 'id'
  | 'gstStateName'
  | 'originBranchName'
  | 'createdAt'
  | 'updatedAt'
>;

export type IUpdateFfmcClient = Partial<ICreateFfmcClient>;

export interface IFfmcClientListQuery {
  search?: string;
  code?: string;
  name?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}

export interface IFfmcClientListResponse {
  data: IFfmcClient[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}
