import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import {
  ReportExportFormatEnum,
  type IFinalAccountReportResponse,
} from '../types';
import { downloadBlob } from '../utils';
import { useFinalAccountReportFilters } from './useFinalAccountReportFilters';

export const useFinalAccountReport = () => {
  const filters = useFinalAccountReportFilters();
  const [exportFormat, setExportFormat] = useState<
    typeof ReportExportFormatEnum.CSV | typeof ReportExportFormatEnum.XLSX
  >(ReportExportFormatEnum.XLSX);
  const requestParams = useMemo(
    () => ({
      startDate: filters.appliedFilters?.dateRange.startDate,
      endDate: filters.appliedFilters?.dateRange.endDate,
      branchIds: filters.appliedFilters?.branchIds ?? [],
      scope: filters.appliedFilters?.scope,
      statementType: filters.appliedFilters?.statementType,
      mergeProfit: filters.appliedFilters?.mergeProfit ?? false,
    }),
    [filters.appliedFilters]
  );
  const reportQuery = useQuery<IFinalAccountReportResponse>({
    queryKey: [
      'final-account-report',
      requestParams.startDate,
      requestParams.endDate,
      requestParams.branchIds,
      requestParams.scope,
      requestParams.statementType,
      requestParams.mergeProfit,
    ],
    enabled: Boolean(
      filters.appliedFilters &&
        requestParams.startDate &&
        requestParams.endDate
    ),
    queryFn: async () => reportsApi.getFinalAccountReport(requestParams),
  });
  const downloadReport = useCallback(async () => {
    if (!filters.appliedFilters) {
      return;
    }
    const payload = await reportsApi.downloadFinalAccountReport(
      requestParams,
      exportFormat
    );
    downloadBlob(
      payload.blob,
      payload.filename || 'final-account-report.xlsx'
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
