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
  'id' | 'countryCode' | 'countryName' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

export type IUpdateStateProfile = Partial<ICreateStateProfile>;

export interface IStateProfileListQuery {
  page?: number;
  limit?: number;
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

export interface IBackendStateListResponse {
  data: IBackendState[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface IStateProfileListResponse {
  data: IStateProfile[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}
