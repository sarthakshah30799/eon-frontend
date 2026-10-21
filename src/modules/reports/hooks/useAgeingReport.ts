import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import { ReportExportFormatEnum, type IAgeingReportResponse } from '../types';
import { downloadBlob } from '../utils';
import { useAgeingReportFilters } from './useAgeingReportFilters';

export const useAgeingReport = () => {
  const filters = useAgeingReportFilters();
  const [exportFormat, setExportFormat] = useState<
    typeof ReportExportFormatEnum.CSV | typeof ReportExportFormatEnum.XLSX
  >(ReportExportFormatEnum.XLSX);
  const requestParams = useMemo(
    () => ({
      startDate: filters.appliedFilters?.dateRange.startDate,
      endDate: filters.appliedFilters?.dateRange.endDate,
      partySelection: filters.appliedFilters?.partySelection,
      entityTypeId: filters.appliedFilters?.entityTypeId || undefined,
      branchIds: filters.appliedFilters?.branchIds ?? [],
      partyProfileIds: filters.appliedFilters?.partyProfileIds ?? [],
      accountIds: filters.appliedFilters?.accountIds ?? [],
      ageingBuckets: filters.appliedFilters?.ageingBuckets ?? [],
      transactionSide: filters.appliedFilters?.transactionSide,
      layout: filters.appliedFilters?.layout,
      eefcFilter: filters.appliedFilters?.eefcFilter,
      scope: filters.appliedFilters?.scope,
    }),
    [filters.appliedFilters]
  );
  const reportQuery = useQuery<IAgeingReportResponse>({
    queryKey: ['ageing-report', filters.appliedFilters],
    enabled: Boolean(filters.appliedFilters),
    queryFn: async () => reportsApi.getAgeingReport(requestParams),
  });
  const downloadReport = useCallback(async () => {
    if (!filters.appliedFilters) {
      return;
    }
    const payload = await reportsApi.downloadAgeingReport(
      requestParams,
      exportFormat
    );
    downloadBlob(payload.blob, payload.filename || 'ageing-report.xlsx');
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
