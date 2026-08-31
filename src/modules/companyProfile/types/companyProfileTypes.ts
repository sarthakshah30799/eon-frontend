import type {
  IOffsetPaginationParams,
  IPaginatedResponse,
} from '@/types/pagination';

export interface ICompanyProfile {
  id: string;
  shortCode?: string;
  name: string;
  formerlyKnownName?: string;
  cinNo?: string;
  panNo: string;
  fxRegNo?: string;
  fxRegDate?: string;
  fromDate?: string;
  toDate?: string;
  logo?: string;
  aeonLicNo?: string;
  website?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICompanyProfileListQuery extends IOffsetPaginationParams {
  search?: string;
}

export type ICompanyProfileListResponse = IPaginatedResponse<ICompanyProfile>;

export interface ICreateCompanyProfile {
  shortCode: string;
  name: string;
  formerlyKnownName: string;
  cinNo: string;
  panNo: string;
  fxRegNo: string;
  fxRegDate: string;
  fromDate: string;
  toDate: string;
  logo: string;
  aeonLicNo: string;
  website: string;
  email: string;
}

export type IUpdateCompanyProfile = Partial<ICreateCompanyProfile>;
