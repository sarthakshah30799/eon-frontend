import type {
  ICreateCounterProfile,
  ICounterProfile,
} from '../types';

export const createEmptyCounterProfileFormValues =
  (): ICreateCounterProfile => ({
    counterNo: '',
    counterName: '',
    isActive: true,
    isRetailCnt: false,
    isBulkCnt: false,
    isCombineCnt: false,
  });

export const mapRecordToFormValues = (
  record: ICounterProfile
): ICreateCounterProfile => ({
  counterNo: String(record.counterNo),
  counterName: record.counterName,
  isActive: record.isActive,
  isRetailCnt: record.isRetailCnt,
  isBulkCnt: record.isBulkCnt,
  isCombineCnt: record.isCombineCnt,
});

export const mapFormValuesToRecord = (
  values: ICreateCounterProfile,
  id: string,
  createdAt: string,
  updatedAt: string
): ICounterProfile => ({
  id,
  createdAt,
  updatedAt,
  ...values,
});
