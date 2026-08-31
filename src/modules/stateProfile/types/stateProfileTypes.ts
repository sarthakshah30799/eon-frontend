import type { IOffsetPaginationParams, IPaginatedResponse } from '@/types/pagination';

export interface IStateProfile {
  id: string;
  countryId: string;
  countryCode: string;
  countryName: string;
  code: string;
  name: string;
  gstStateCode: string;
  ctrStateCode: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export type ICreateStateProfile = Omit<
  IStateProfile,
  | 'id'
  | 'countryCode'
  | 'countryName'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
>;

export type IUpdateStateProfile = Partial<ICreateStateProfile>;

export interface IStateProfileListQuery extends IOffsetPaginationParams {
  search?: string;
  countryId?: string;
  code?: string;
  name?: string;
  gstStateCode?: string;
  ctrStateCode?: string;
}

export interface IBackendState {
  id: string;
  countryId: string;
  countryCode: string;
  countryName: string;
  code: string;
  name: string;
  gstStateCode?: string | null;
  ctrStateCode?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type IBackendStateListResponse = IPaginatedResponse<IBackendState>;

export type IStateProfileListResponse = IPaginatedResponse<IStateProfile>;
