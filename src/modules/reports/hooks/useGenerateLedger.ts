import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import {
  ReportExportFormatEnum,
  type IGenerateLedgerResponse,
} from '../types';
import { downloadBlob } from '../utils';
import { useGenerateLedgerFilters } from './useGenerateLedgerFilters';

export const useGenerateLedger = () => {
  const filters = useGenerateLedgerFilters();
  const [exportFormat, setExportFormat] = useState<
    typeof ReportExportFormatEnum.CSV | typeof ReportExportFormatEnum.XLSX
  >(ReportExportFormatEnum.XLSX);

  const requestParams = useMemo(
    () => ({
      startDate: filters.appliedFilters?.dateRange.startDate,
      endDate: filters.appliedFilters?.dateRange.endDate,
      layout: filters.appliedFilters?.layout,
      branchIds: filters.appliedFilters?.branchIds ?? [],
      accountTypeIds: filters.appliedFilters?.accountTypeIds ?? [],
      accountIds: filters.appliedFilters?.accountIds ?? [],
    }),
    [filters.appliedFilters]
  );

  const reportQuery = useQuery<IGenerateLedgerResponse>({
    queryKey: ['generate-ledger', filters.appliedFilters],
    enabled: Boolean(filters.appliedFilters),
    queryFn: async () => reportsApi.getGenerateLedger(requestParams),
  });

  const downloadReport = useCallback(async () => {
    if (!filters.appliedFilters) {
      return;
    }

    const payload = await reportsApi.downloadGenerateLedger(
      requestParams,
      exportFormat
    );

    downloadBlob(payload.blob, payload.filename || 'generate-ledger.xlsx');
  }, [exportFormat, filters.appliedFilters, requestParams]);

  return {
    filters,
    exportFormat,
    setExportFormat,
    reportColumns: reportQuery.data?.columns ?? [],
    reportSections: reportQuery.data?.sections ?? [],
    reportLayout: reportQuery.data?.layout,
    isLoadingReport: reportQuery.isLoading,
    isFetchingReport: reportQuery.isFetching,
    reportError: reportQuery.error,
    isReady: Boolean(filters.appliedFilters),
    downloadReport,
    appliedDateRangeLabel: filters.appliedDateRangeLabel,
  };
};

export default useGenerateLedger;
