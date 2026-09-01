import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import {
  ReportExportFormatEnum,
  type ICurrencyBalanceReportResponse,
} from '../types';
import { downloadBlob } from '../utils';
import { useCurrencyBalanceReportFilters } from './useCurrencyBalanceReportFilters';

export const useCurrencyBalanceReport = () => {
  const filters = useCurrencyBalanceReportFilters();
  const [exportFormat, setExportFormat] = useState<
    typeof ReportExportFormatEnum.CSV | typeof ReportExportFormatEnum.XLSX
  >(ReportExportFormatEnum.XLSX);

  const requestParams = useMemo(
    () => ({
      startDate: filters.appliedFilters?.dateRange.startDate,
      endDate: filters.appliedFilters?.dateRange.endDate,
      branchIds: filters.appliedFilters?.branchIds ?? [],
      counterIds: filters.appliedFilters?.counterIds ?? [],
      currencyIds: filters.appliedFilters?.currencyIds ?? [],
    }),
    [filters.appliedFilters]
  );

  const reportQueryKey = useMemo(
    () => ['currency-balance-report', filters.appliedFilters],
    [filters.appliedFilters]
  );

  const reportQuery = useQuery<ICurrencyBalanceReportResponse>({
    queryKey: reportQueryKey,
    enabled: Boolean(filters.appliedFilters),
    queryFn: async () =>
      reportsApi.getCurrencyBalanceReport({
        ...requestParams,
      }),
  });

  const reportColumns = reportQuery.data?.columns ?? [];
  const reportRows = reportQuery.data?.rows ?? [];

  const downloadReport = useCallback(async () => {
    if (!filters.appliedFilters) {
      return;
    }

    const payload = await reportsApi.downloadCurrencyBalanceReport(
      {
        ...requestParams,
      },
      exportFormat
    );

    downloadBlob(
      payload.blob,
      payload.filename || 'currency-balance-report.xlsx'
    );
  }, [exportFormat, filters.appliedFilters, requestParams]);

  return {
    filters,
    exportFormat,
    setExportFormat,
    reportColumns,
    reportRows,
    isLoadingReport: reportQuery.isLoading,
    isFetchingReport: reportQuery.isFetching,
    reportError: reportQuery.error,
    isReady: Boolean(filters.appliedFilters),
    downloadReport,
    appliedDateRangeLabel: filters.appliedDateRangeLabel,
  };
};

export default useCurrencyBalanceReport;
