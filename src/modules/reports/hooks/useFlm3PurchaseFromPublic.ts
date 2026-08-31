import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import {
  ReportExportFormatEnum,
  type IFlm3PurchaseFromPublicResponse,
} from '../types';
import { downloadBlob } from '../utils';
import { useFlm3PurchaseFromPublicFilters } from './useFlm3PurchaseFromPublicFilters';

export const useFlm3PurchaseFromPublic = () => {
  const filters = useFlm3PurchaseFromPublicFilters();
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
    [filters.appliedFilters, filters.view, filters.layout]
  );

  const reportQueryKey = useMemo(
    () => ['flm3-purchase-from-public', requestParams],
    [requestParams]
  );

  const reportQuery = useQuery<IFlm3PurchaseFromPublicResponse>({
    queryKey: reportQueryKey,
    enabled: Boolean(filters.appliedFilters),
    queryFn: async () =>
      reportsApi.getFlm3PurchaseFromPublic({
        ...requestParams,
      }),
  });

  const downloadReport = useCallback(async () => {
    if (!filters.appliedFilters) {
      return;
    }

    const payload = await reportsApi.downloadFlm3PurchaseFromPublic(
      {
        ...requestParams,
      },
      exportFormat
    );

    downloadBlob(
      payload.blob,
      payload.filename || 'flm3-purchase-from-public.xlsx'
    );
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

export default useFlm3PurchaseFromPublic;
