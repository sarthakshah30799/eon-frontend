import type { QueryClient } from '@tanstack/react-query';
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

export const syncCounterProfileCache = (
  queryClient: QueryClient,
  updatedCounter: ICounterProfile
): void => {
  queryClient.setQueriesData<ICounterProfile[]>(
    { queryKey: ['counter-profiles'] },
    currentCounters =>
      currentCounters?.map(counter =>
        counter.id === updatedCounter.id ? updatedCounter : counter
      ) ?? currentCounters
  );

  queryClient.setQueryData(
    ['counter-profile', updatedCounter.id],
    updatedCounter
  );
};
