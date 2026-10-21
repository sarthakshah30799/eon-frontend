import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import {
  ReportExportFormatEnum,
  type IOutstandingTransactionReportResponse,
} from '../types';
import { downloadBlob } from '../utils';
import { useOutstandingTransactionReportFilters } from './useOutstandingTransactionReportFilters';

export const useOutstandingTransactionReport = () => {
  const filters = useOutstandingTransactionReportFilters();
  const [exportFormat, setExportFormat] = useState<
    typeof ReportExportFormatEnum.CSV | typeof ReportExportFormatEnum.XLSX
  >(ReportExportFormatEnum.XLSX);
  const requestParams = useMemo(
    () => ({
      startDate: filters.appliedFilters?.dateRange.startDate,
      endDate: filters.appliedFilters?.dateRange.endDate,
      accountingDate: filters.appliedFilters?.accountingDate,
      partySelection: filters.appliedFilters?.partySelection,
      entityTypeId: filters.appliedFilters?.entityTypeId || undefined,
      branchIds: filters.appliedFilters?.branchIds ?? [],
      partyProfileIds: filters.appliedFilters?.partyProfileIds ?? [],
      transactionSide: filters.appliedFilters?.transactionSide,
      includeInterest: filters.appliedFilters?.includeInterest || undefined,
      includeInsurance: filters.appliedFilters?.includeInsurance || undefined,
      grouping: filters.appliedFilters?.grouping,
      layout: filters.appliedFilters?.layout,
    }),
    [filters.appliedFilters]
  );
  const reportQuery = useQuery<IOutstandingTransactionReportResponse>({
    queryKey: ['outstanding-transaction-report', filters.appliedFilters],
    enabled: Boolean(filters.appliedFilters),
    queryFn: async () => reportsApi.getOutstandingTransactionReport(requestParams),
  });
  const downloadReport = useCallback(async () => {
    if (!filters.appliedFilters) {
      return;
    }
    const payload = await reportsApi.downloadOutstandingTransactionReport(
      requestParams,
      exportFormat
    );
    downloadBlob(
      payload.blob,
      payload.filename || 'outstanding-transaction-report.xlsx'
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
