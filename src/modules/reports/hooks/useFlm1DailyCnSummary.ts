import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import {
  ReportExportFormatEnum,
  type IFlm1DailyCnSummaryResponse,
} from '../types';
import { downloadBlob } from '../utils';
import { useFlm1DailyCnSummaryFilters } from './useFlm1DailyCnSummaryFilters';

export const useFlm1DailyCnSummary = () => {
  const filters = useFlm1DailyCnSummaryFilters();
  const [exportFormat, setExportFormat] = useState<
    typeof ReportExportFormatEnum.CSV | typeof ReportExportFormatEnum.XLSX
  >(ReportExportFormatEnum.XLSX);

  const requestParams = useMemo(
    () => ({
      date: filters.appliedFilters?.dateRange.startDate,
      branchIds: filters.appliedFilters?.branchIds ?? [],
      productId: filters.appliedFilters?.productId,
    }),
    [filters.appliedFilters],
  );

  const reportQueryKey = useMemo(
    () => ['flm1-daily-cn-summary', filters.appliedFilters],
    [filters.appliedFilters],
  );

  const reportQuery = useQuery<IFlm1DailyCnSummaryResponse>({
    queryKey: reportQueryKey,
    enabled: Boolean(filters.appliedFilters),
    queryFn: async () =>
      reportsApi.getFlm1DailyCnSummary({
        ...requestParams,
      }),
  });

  const downloadReport = useCallback(async () => {
    if (!filters.appliedFilters) {
      return;
    }

    const payload = await reportsApi.downloadFlm1DailyCnSummary(
      {
        ...requestParams,
      },
      exportFormat,
    );

    downloadBlob(payload.blob, payload.filename || 'flm1-daily-cn-summary.xlsx');
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

export default useFlm1DailyCnSummary;
