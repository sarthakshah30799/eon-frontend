import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import { ReportExportFormatEnum, type ITourPaxReportResponse } from '../types';
import { downloadBlob } from '../utils';
import { useTourPaxReportFilters } from './useTourPaxReportFilters';

export const useTourPaxReport = () => {
  const filters = useTourPaxReportFilters();
  const [exportFormat, setExportFormat] = useState<
    typeof ReportExportFormatEnum.CSV | typeof ReportExportFormatEnum.XLSX
  >(ReportExportFormatEnum.XLSX);

  const requestParams = useMemo(
    () => ({
      startDate: filters.appliedFilters?.dateRange.startDate,
      endDate: filters.appliedFilters?.dateRange.endDate,
      branchIds: filters.appliedFilters?.branchIds ?? [],
    }),
    [filters.appliedFilters]
  );

  const reportQuery = useQuery<ITourPaxReportResponse>({
    queryKey: ['tour-pax-report', filters.appliedFilters],
    enabled: Boolean(filters.appliedFilters),
    queryFn: async () => reportsApi.getTourPaxReport(requestParams),
  });

  const downloadReport = useCallback(async () => {
    if (!filters.appliedFilters) {
      return;
    }
    const payload = await reportsApi.downloadTourPaxReport(
      requestParams,
      exportFormat
    );
    downloadBlob(payload.blob, payload.filename || 'tour-pax-report.xlsx');
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
