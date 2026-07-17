import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import { ReportExportFormatEnum, type ISpecialReportResponse } from '../types';
import { downloadBlob } from '../utils';
import { useSpecialReportFilters } from './useSpecialReportFilters';

export const useSpecialReport = () => {
  const filters = useSpecialReportFilters();
  const [exportFormat, setExportFormat] = useState<
    typeof ReportExportFormatEnum.CSV | typeof ReportExportFormatEnum.XLSX
  >(ReportExportFormatEnum.XLSX);

  const requestParams = useMemo(
    () => ({
      branchIds: filters.appliedFilters?.branchIds ?? [],
      template: filters.appliedFilters?.template,
      transactionNumbers: filters.appliedFilters?.transactionNumbers ?? [],
      sortBy: filters.appliedFilters?.sortBy,
    }),
    [filters.appliedFilters],
  );

  const reportQueryKey = useMemo(
    () => ['special-reports', filters.appliedFilters],
    [filters.appliedFilters],
  );

  const reportQuery = useQuery<ISpecialReportResponse>({
    queryKey: reportQueryKey,
    enabled: Boolean(filters.appliedFilters),
    queryFn: async () => {
      return reportsApi.getSpecialReport({
        ...requestParams,
      });
    },
  });

  const reportColumns = reportQuery.data?.columns ?? [];
  const reportRows = reportQuery.data?.rows ?? [];

  const downloadReport = useCallback(async () => {
    if (!filters.appliedFilters) {
      return;
    }

    const payload = await reportsApi.downloadSpecialReport(
      {
        ...requestParams,
      },
      exportFormat,
    );

      downloadBlob(
      payload.blob,
      payload.filename ||
        (exportFormat === ReportExportFormatEnum.CSV
          ? 'special-reports-account-posting.csv'
          : 'special-reports-account-posting.xlsx'),
    );
  }, [exportFormat, filters.appliedFilters, requestParams]);

  const isReady = Boolean(filters.appliedFilters);

  return {
    filters,
    exportFormat,
    setExportFormat,
    reportColumns,
    reportRows,
    isLoadingReport: reportQuery.isLoading,
    isFetchingReport: reportQuery.isFetching,
    reportError: reportQuery.error,
    isReady,
    downloadReport,
  };
};

export default useSpecialReport;
