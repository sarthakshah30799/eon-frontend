import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import {
  ReportExportFormatEnum,
  type IFlm8Ad2Response,
} from '../types';
import { downloadBlob } from '../utils';
import { useFlm8Ad2Filters } from './useFlm8Ad2Filters';

export const useFlm8Ad2 = () => {
  const filters = useFlm8Ad2Filters();
  const [exportFormat, setExportFormat] = useState<
    typeof ReportExportFormatEnum.CSV | typeof ReportExportFormatEnum.XLSX
  >(ReportExportFormatEnum.XLSX);

  const requestParams = useMemo(
    () => ({
      startDate: filters.appliedFilters?.dateRange.startDate,
      endDate: filters.appliedFilters?.dateRange.endDate,
      branchIds: filters.appliedFilters?.branchIds ?? [],
      reportFormat: filters.appliedFilters?.reportFormat,
      apConnect: filters.appliedFilters?.apConnect || undefined,
    }),
    [filters.appliedFilters]
  );

  const reportQuery = useQuery<IFlm8Ad2Response>({
    queryKey: ['flm8-ad2', filters.appliedFilters],
    enabled: Boolean(filters.appliedFilters),
    queryFn: async () => reportsApi.getFlm8Ad2(requestParams),
  });

  const downloadReport = useCallback(async () => {
    if (!filters.appliedFilters) {
      return;
    }
    const payload = await reportsApi.downloadFlm8Ad2(
      requestParams,
      exportFormat
    );
    downloadBlob(payload.blob, payload.filename || 'flm8-ad2.xlsx');
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
