import type {
  ICreateCounterProfile,
  ICounterProfile,
} from '../types';

export const createEmptyCounterProfileFormValues =
  (): ICreateCounterProfile => ({
    counterNo: '',
    name: '',
    isActive: true,
    isRetail: false,
    isBulk: false,
    isCombine: false,
  });

export const mapRecordToFormValues = (
  record: ICounterProfile
): ICreateCounterProfile => ({
  counterNo: String(record.counterNo),
  name: record.name,
  isActive: record.isActive,
  isRetail: record.isRetail,
  isBulk: record.isBulk,
  isCombine: record.isCombine,
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
