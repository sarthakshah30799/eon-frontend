import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import {
  ReportExportFormatEnum,
  type IBankReportResponse,
} from '../types';
import { downloadBlob } from '../utils';
import { useBankReportFilters } from './useBankReportFilters';

export const useBankReport = () => {
  const filters = useBankReportFilters();
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

  const reportQuery = useQuery<IBankReportResponse>({
    queryKey: ['bank-report', filters.appliedFilters],
    enabled: Boolean(filters.appliedFilters),
    queryFn: async () => reportsApi.getBankReport(requestParams),
  });

  const downloadReport = useCallback(async () => {
    if (!filters.appliedFilters) {
      return;
    }

    const payload = await reportsApi.downloadBankReport(
      requestParams,
      exportFormat
    );

    downloadBlob(payload.blob, payload.filename || 'bank-report.xlsx');
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

export default useBankReport;
