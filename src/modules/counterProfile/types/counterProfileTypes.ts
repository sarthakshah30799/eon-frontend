export interface CounterProfileFormValues {
  counterNo: string;
  counterName: string;
  isActive: boolean;
  isRetailCnt: boolean;
  isBulkCnt: boolean;
  isCombineCnt: boolean;
}

export interface CounterProfileRecord extends CounterProfileFormValues {
  id: string;
  createdAt: string;
  updatedAt: string;
}
