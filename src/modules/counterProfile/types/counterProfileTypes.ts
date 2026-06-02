export interface ICounterProfile {
  id: string;
  counterNo: string;
  counterName: string;
  isActive: boolean;
  isRetailCnt: boolean;
  isBulkCnt: boolean;
  isCombineCnt: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export type ICreateCounterProfile = Omit<
  ICounterProfile,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

export type IUpdateCounterProfile = Partial<ICreateCounterProfile>;
