import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import {
  ReportExportFormatEnum,
  type ICashFlowReportResponse,
} from '../types';
import { downloadBlob } from '../utils';
import { useCashFlowReportFilters } from './useCashFlowReportFilters';

export const useCashFlowReport = () => {
  const filters = useCashFlowReportFilters();
  const [exportFormat, setExportFormat] = useState<
    typeof ReportExportFormatEnum.CSV | typeof ReportExportFormatEnum.XLSX
  >(ReportExportFormatEnum.XLSX);

  const requestParams = useMemo(
    () => ({
      startDate: filters.appliedFilters?.dateRange.startDate,
      endDate: filters.appliedFilters?.dateRange.endDate,
      branchIds: filters.appliedFilters?.branchIds ?? [],
      accountIds: filters.appliedFilters?.accountIds ?? [],
      counterIds: filters.appliedFilters?.counterIds ?? [],
      scope: filters.appliedFilters?.scope,
    }),
    [filters.appliedFilters]
  );

  const reportQuery = useQuery<ICashFlowReportResponse>({
    queryKey: [
      'cash-flow-report',
      requestParams.startDate,
      requestParams.endDate,
      requestParams.branchIds,
      requestParams.accountIds,
      requestParams.counterIds,
      requestParams.scope,
    ],
    enabled: Boolean(
      filters.appliedFilters &&
        requestParams.startDate &&
        requestParams.endDate
    ),
    queryFn: async () => reportsApi.getCashFlowReport(requestParams),
  });

  const downloadReport = useCallback(async () => {
    if (!filters.appliedFilters) {
      return;
    }
    const payload = await reportsApi.downloadCashFlowReport(
      requestParams,
      exportFormat
    );
    downloadBlob(payload.blob, payload.filename || 'cash-flow-report.xlsx');
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

export default useCashFlowReport;
