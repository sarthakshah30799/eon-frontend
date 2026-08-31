import type {
  IOffsetPaginationParams,
  IPaginatedResponse,
} from '@/types/pagination';

export interface ITdsProfile {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  active: boolean;
  sortOrder: number;
  from: string;
  to: string;
  value: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export type ICreateTdsProfile = {
  code: string;
  name: string;
  description?: string | null;
  active: boolean;
  sortOrder: number;
  from?: string | null;
  to?: string | null;
  value: number;
};

export type IUpdateTdsProfile = Partial<ICreateTdsProfile>;

export interface ITdsProfileListQuery extends IOffsetPaginationParams {
  search?: string;
}

export type ITdsProfileListResponse = IPaginatedResponse<ITdsProfile>;
