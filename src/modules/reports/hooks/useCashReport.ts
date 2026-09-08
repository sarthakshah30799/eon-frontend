import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import {
  ReportExportFormatEnum,
  type ICashReportResponse,
} from '../types';
import { downloadBlob } from '../utils';
import { useCashReportFilters } from './useCashReportFilters';

export const useCashReport = () => {
  const filters = useCashReportFilters();
  const [exportFormat, setExportFormat] = useState<
    typeof ReportExportFormatEnum.CSV | typeof ReportExportFormatEnum.XLSX
  >(ReportExportFormatEnum.XLSX);

  const requestParams = useMemo(
    () => ({
      startDate: filters.appliedFilters?.dateRange.startDate,
      endDate: filters.appliedFilters?.dateRange.endDate,
      layout: filters.appliedFilters?.layout,
      branchIds: filters.appliedFilters?.branchIds ?? [],
      accountIds: filters.appliedFilters?.accountIds ?? [],
    }),
    [filters.appliedFilters]
  );

  const reportQuery = useQuery<ICashReportResponse>({
    queryKey: ['cash-report', filters.appliedFilters],
    enabled: Boolean(filters.appliedFilters),
    queryFn: async () => reportsApi.getCashReport(requestParams),
  });

  const downloadReport = useCallback(async () => {
    if (!filters.appliedFilters) {
      return;
    }

    const payload = await reportsApi.downloadCashReport(
      requestParams,
      exportFormat
    );

    downloadBlob(payload.blob, payload.filename || 'cash-report.xlsx');
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

export default useCashReport;
