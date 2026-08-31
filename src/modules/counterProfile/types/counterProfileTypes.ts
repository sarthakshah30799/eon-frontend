export interface ICounterProfile {
  id: string;
  counterNo: string;
  name: string;
  isActive: boolean;
  isRetail: boolean;
  isBulk: boolean;
  isCombine: boolean;
  branchIds?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

import type { IOffsetPaginationParams } from '@/types/pagination';

export interface ICounterProfileListQuery extends IOffsetPaginationParams {
  activeOnly?: boolean;
  search?: string;
  branchId?: string;
}

export type ICreateCounterProfile = Omit<
  ICounterProfile,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'branchIds'
> & {
  branchIds?: string[];
};

export type IUpdateCounterProfile = Partial<ICreateCounterProfile>;
