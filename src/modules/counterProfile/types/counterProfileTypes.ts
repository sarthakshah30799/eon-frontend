export interface ICounterProfile {
  id: string;
  counterNo: string;
  name: string;
  isActive: boolean;
  isRetail: boolean;
  isBulk: boolean;
  isCombine: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ICounterProfileListQuery {
  activeOnly?: boolean;
  search?: string;
}

export type ICreateCounterProfile = Omit<
  ICounterProfile,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

export type IUpdateCounterProfile = Partial<ICreateCounterProfile>;
