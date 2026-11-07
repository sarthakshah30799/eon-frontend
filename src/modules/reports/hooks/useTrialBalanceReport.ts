import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import {
  ReportExportFormatEnum,
  type ITrialBalanceReportResponse,
} from '../types';
import { downloadBlob } from '../utils';
import { useTrialBalanceReportFilters } from './useTrialBalanceReportFilters';

export const useTrialBalanceReport = () => {
  const filters = useTrialBalanceReportFilters();
  const [exportFormat, setExportFormat] = useState<
    typeof ReportExportFormatEnum.CSV | typeof ReportExportFormatEnum.XLSX
  >(ReportExportFormatEnum.XLSX);
  const requestParams = useMemo(
    () => ({
      startDate: filters.appliedFilters?.dateRange.startDate,
      endDate: filters.appliedFilters?.dateRange.endDate,
      branchIds: filters.appliedFilters?.branchIds ?? [],
      scope: filters.appliedFilters?.scope,
      groupBy: filters.appliedFilters?.groupBy,
    }),
    [filters.appliedFilters]
  );
  const reportQuery = useQuery<ITrialBalanceReportResponse>({
    queryKey: ['trial-balance-report', filters.appliedFilters],
    enabled: Boolean(filters.appliedFilters),
    queryFn: async () => reportsApi.getTrialBalanceReport(requestParams),
  });
  const downloadReport = useCallback(async () => {
    if (!filters.appliedFilters) {
      return;
    }
    const payload = await reportsApi.downloadTrialBalanceReport(
      requestParams,
      exportFormat
    );
    downloadBlob(
      payload.blob,
      payload.filename || 'trial-balance-report.xlsx'
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
