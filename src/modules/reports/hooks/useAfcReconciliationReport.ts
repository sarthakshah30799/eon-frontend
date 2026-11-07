import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import {
  ReportExportFormatEnum,
  type IAfcReconciliationReportResponse,
} from '../types';
import { downloadBlob } from '../utils';
import { useAfcReconciliationReportFilters } from './useAfcReconciliationReportFilters';

export const useAfcReconciliationReport = () => {
  const filters = useAfcReconciliationReportFilters();
  const [exportFormat, setExportFormat] = useState<
    typeof ReportExportFormatEnum.CSV | typeof ReportExportFormatEnum.XLSX
  >(ReportExportFormatEnum.XLSX);
  const requestParams = useMemo(
    () => ({
      startDate: filters.appliedFilters?.dateRange.startDate,
      endDate: filters.appliedFilters?.dateRange.endDate,
      accountingDate: filters.appliedFilters?.accountingDate,
      branchIds: filters.appliedFilters?.branchIds ?? [],
      counterIds: filters.appliedFilters?.counterIds ?? [],
      layout: filters.appliedFilters?.layout,
      scope: filters.appliedFilters?.scope,
    }),
    [filters.appliedFilters]
  );
  const reportQuery = useQuery<IAfcReconciliationReportResponse>({
    queryKey: ['afc-reconciliation-report', filters.appliedFilters],
    enabled: Boolean(filters.appliedFilters),
    queryFn: async () => reportsApi.getAfcReconciliationReport(requestParams),
  });
  const downloadReport = useCallback(async () => {
    if (!filters.appliedFilters) {
      return;
    }
    const payload = await reportsApi.downloadAfcReconciliationReport(
      requestParams,
      exportFormat
    );
    downloadBlob(
      payload.blob,
      payload.filename || 'afc-reconciliation-report.xlsx'
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
