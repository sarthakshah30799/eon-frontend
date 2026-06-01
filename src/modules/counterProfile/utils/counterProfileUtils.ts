import type {
  CounterProfileFormValues,
  CounterProfileRecord,
} from '../types';

export const createEmptyCounterProfileFormValues =
  (): CounterProfileFormValues => ({
    counterCode: '',
    counterName: '',
    isActive: true,
  });

export const mapRecordToFormValues = (
  record: CounterProfileRecord
): CounterProfileFormValues => ({
  counterCode: record.counterCode,
  counterName: record.counterName,
  isActive: record.isActive,
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
