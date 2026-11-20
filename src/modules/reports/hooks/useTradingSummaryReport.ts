import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import {
  ReportExportFormatEnum,
  type ITradingSummaryReportResponse,
} from '../types';
import { downloadBlob } from '../utils';
import { useTradingSummaryReportFilters } from './useTradingSummaryReportFilters';

export const useTradingSummaryReport = () => {
  const filters = useTradingSummaryReportFilters();
  const [exportFormat, setExportFormat] = useState<
    typeof ReportExportFormatEnum.CSV | typeof ReportExportFormatEnum.XLSX
  >(ReportExportFormatEnum.XLSX);

  const requestParams = useMemo(
    () => ({
      startDate: filters.appliedFilters?.dateRange.startDate,
      endDate: filters.appliedFilters?.dateRange.endDate,
      branchIds: filters.appliedFilters?.branchIds ?? [],
      scope: filters.appliedFilters?.scope,
      diffFilter: filters.appliedFilters?.diffFilter,
    }),
    [filters.appliedFilters]
  );

  const reportQuery = useQuery<ITradingSummaryReportResponse>({
    queryKey: [
      'trading-summary-report',
      requestParams.startDate,
      requestParams.endDate,
      requestParams.branchIds,
      requestParams.scope,
      requestParams.diffFilter,
    ],
    enabled: Boolean(
      filters.appliedFilters &&
        requestParams.startDate &&
        requestParams.endDate
    ),
    queryFn: async () => reportsApi.getTradingSummaryReport(requestParams),
  });

  const downloadReport = useCallback(async () => {
    if (!filters.appliedFilters) {
      return;
    }
    const payload = await reportsApi.downloadTradingSummaryReport(
      requestParams,
      exportFormat
    );
    downloadBlob(
      payload.blob,
      payload.filename || 'trading-summary-report.xlsx'
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

export default useTradingSummaryReport;
