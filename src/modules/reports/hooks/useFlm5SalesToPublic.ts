import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import {
  ReportExportFormatEnum,
  type IFlm5SalesToPublicResponse,
} from '../types';
import { downloadBlob } from '../utils';
import { useFlm5SalesToPublicFilters } from './useFlm5SalesToPublicFilters';

export const useFlm5SalesToPublic = () => {
  const filters = useFlm5SalesToPublicFilters();
  const [exportFormat, setExportFormat] = useState<
    typeof ReportExportFormatEnum.CSV | typeof ReportExportFormatEnum.XLSX
  >(ReportExportFormatEnum.XLSX);

  const requestParams = useMemo(
    () => ({
      startDate: filters.appliedFilters?.dateRange.startDate,
      endDate: filters.appliedFilters?.dateRange.endDate,
      branchIds: filters.appliedFilters?.branchIds ?? [],
      productId: filters.appliedFilters?.productId,
      view: filters.appliedFilters?.view ?? filters.view,
      layout: filters.appliedFilters?.layout ?? filters.layout,
    }),
    [filters.appliedFilters, filters.view, filters.layout],
  );

  const reportQueryKey = useMemo(
    () => ['flm5-sales-to-public', requestParams],
    [requestParams],
  );

  const reportQuery = useQuery<IFlm5SalesToPublicResponse>({
    queryKey: reportQueryKey,
    enabled: Boolean(filters.appliedFilters),
    queryFn: async () =>
      reportsApi.getFlm5SalesToPublic({
        ...requestParams,
      }),
  });

  const downloadReport = useCallback(async () => {
    if (!filters.appliedFilters) {
      return;
    }

    const payload = await reportsApi.downloadFlm5SalesToPublic(
      {
        ...requestParams,
      },
      exportFormat,
    );

    downloadBlob(payload.blob, payload.filename || 'flm5-sales-to-public.xlsx');
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

export default useFlm5SalesToPublic;
