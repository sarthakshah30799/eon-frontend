import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import {
  ReportExportFormatEnum,
  type IFlm6SalesToFfmcResponse,
} from '../types';
import { downloadBlob } from '../utils';
import { useFlm6SalesToFfmcFilters } from './useFlm6SalesToFfmcFilters';

export const useFlm6SalesToFfmc = () => {
  const filters = useFlm6SalesToFfmcFilters();
  const [exportFormat, setExportFormat] = useState<
    typeof ReportExportFormatEnum.CSV | typeof ReportExportFormatEnum.XLSX
  >(ReportExportFormatEnum.XLSX);

  const requestParams = useMemo(
    () => ({
      startDate: filters.appliedFilters?.dateRange.startDate,
      endDate: filters.appliedFilters?.dateRange.endDate,
      branchIds: filters.appliedFilters?.branchIds ?? [],
      profileTypes: filters.appliedFilters?.profileTypes ?? [],
      productId: filters.appliedFilters?.productId,
      view: filters.appliedFilters?.view ?? filters.view,
      layout: filters.appliedFilters?.layout ?? filters.layout,
    }),
    [filters.appliedFilters, filters.view, filters.layout]
  );

  const reportQueryKey = useMemo(
    () => ['flm6-sales-to-ffmc', requestParams],
    [requestParams]
  );

  const reportQuery = useQuery<IFlm6SalesToFfmcResponse>({
    queryKey: reportQueryKey,
    enabled: Boolean(filters.appliedFilters),
    queryFn: async () =>
      reportsApi.getFlm6SalesToFfmc({
        ...requestParams,
      }),
  });

  const downloadReport = useCallback(async () => {
    if (!filters.appliedFilters) {
      return;
    }

    const payload = await reportsApi.downloadFlm6SalesToFfmc(
      {
        ...requestParams,
      },
      exportFormat
    );

    downloadBlob(payload.blob, payload.filename || 'flm6-sales-to-ffmc.xlsx');
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

export default useFlm6SalesToFfmc;
