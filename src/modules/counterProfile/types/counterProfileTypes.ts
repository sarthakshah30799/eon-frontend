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

export interface ICounterProfileListQuery {
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
