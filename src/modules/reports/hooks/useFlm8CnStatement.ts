import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import {
  ReportExportFormatEnum,
  type IFlm8CnStatementResponse,
} from '../types';
import { downloadBlob } from '../utils';
import { useFlm8CnStatementFilters } from './useFlm8CnStatementFilters';

export const useFlm8CnStatement = () => {
  const filters = useFlm8CnStatementFilters();
  const [exportFormat, setExportFormat] = useState<
    typeof ReportExportFormatEnum.CSV | typeof ReportExportFormatEnum.XLSX
  >(ReportExportFormatEnum.XLSX);

  const requestParams = useMemo(
    () => ({
      startDate: filters.appliedFilters?.dateRange.startDate,
      endDate: filters.appliedFilters?.dateRange.endDate,
      branchIds: filters.appliedFilters?.branchIds ?? [],
      productId: filters.appliedFilters?.productId,
      profileType: filters.appliedFilters?.profileType,
      apConnect: filters.appliedFilters?.apConnect || undefined,
      view: filters.appliedFilters?.view ?? filters.view,
    }),
    [filters.appliedFilters, filters.view],
  );

  const reportQueryKey = useMemo(
    () => ['flm8-cn-statement', requestParams],
    [requestParams],
  );

  const reportQuery = useQuery<IFlm8CnStatementResponse>({
    queryKey: reportQueryKey,
    enabled: Boolean(filters.appliedFilters),
    queryFn: async () =>
      reportsApi.getFlm8CnStatement({
        ...requestParams,
      }),
  });

  const downloadReport = useCallback(async () => {
    if (!filters.appliedFilters) {
      return;
    }

    const payload = await reportsApi.downloadFlm8CnStatement(
      {
        ...requestParams,
      },
      exportFormat,
    );

    downloadBlob(payload.blob, payload.filename || 'flm8-cn-statement.xlsx');
  }, [exportFormat, filters.appliedFilters, requestParams]);

  return {
    filters,
    exportFormat,
    setExportFormat,
    report: reportQuery.data ?? null,
    isLoadingReport: reportQuery.isLoading,
    isFetchingReport: reportQuery.isFetching,
    reportError: reportQuery.error,
    isReady: Boolean(filters.appliedFilters),
    downloadReport,
    appliedDateRangeLabel: filters.appliedDateRangeLabel,
  };
};

export default useFlm8CnStatement;
