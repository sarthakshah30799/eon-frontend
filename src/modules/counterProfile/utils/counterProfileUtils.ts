import type {
  CounterProfileFormValues,
  CounterProfileRecord,
} from '../types';

export const createEmptyCounterProfileFormValues =
  (): CounterProfileFormValues => ({
    counterNo: '',
    counterName: '',
    isActive: true,
    isRetailCnt: false,
    isBulkCnt: false,
    isCombineCnt: false,
  });

export const mapRecordToFormValues = (
  record: CounterProfileRecord
): CounterProfileFormValues => ({
  counterNo: String(record.counterNo),
  counterName: record.counterName,
  isActive: record.isActive,
  isRetailCnt: record.isRetailCnt,
  isBulkCnt: record.isBulkCnt,
  isCombineCnt: record.isCombineCnt,
});

export const mapFormValuesToRecord = (
  values: CounterProfileFormValues,
  id: string,
  createdAt: string,
  updatedAt: string
): CounterProfileRecord => ({
  id,
  createdAt,
  updatedAt,
  ...values,
});
