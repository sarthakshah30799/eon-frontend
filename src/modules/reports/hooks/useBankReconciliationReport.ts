import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import {
  ReportExportFormatEnum,
  type IBankReconciliationReportResponse,
} from '../types';
import { downloadBlob } from '../utils';
import { useBankReconciliationReportFilters } from './useBankReconciliationReportFilters';

export type BankReconciliationExportFormat =
  | typeof ReportExportFormatEnum.CSV
  | typeof ReportExportFormatEnum.XLSX
  | 'pdf';

export const useBankReconciliationReport = () => {
  const filters = useBankReconciliationReportFilters();
  const [exportFormat, setExportFormat] =
    useState<BankReconciliationExportFormat>(ReportExportFormatEnum.XLSX);

  const requestParams = useMemo(
    () => ({
      startDate: filters.appliedFilters?.dateRange.startDate,
      endDate: filters.appliedFilters?.dateRange.endDate,
      layout: filters.appliedFilters?.layout,
      branchIds: filters.appliedFilters?.branchIds ?? [],
      accountIds: filters.appliedFilters?.accountIds ?? [],
      unclearedOnly: filters.appliedFilters?.unclearedOnly ?? true,
    }),
    [filters.appliedFilters]
  );

  const reportQuery = useQuery<IBankReconciliationReportResponse>({
    queryKey: ['bank-reconciliation-report', filters.appliedFilters],
    enabled: Boolean(filters.appliedFilters),
    queryFn: async () =>
      reportsApi.getBankReconciliationReport(requestParams),
  });

  const downloadReport = useCallback(async () => {
    if (!filters.appliedFilters) {
      return;
    }

    const payload = await reportsApi.downloadBankReconciliationReport(
      requestParams,
      exportFormat
    );

    downloadBlob(
      payload.blob,
      payload.filename || `bank-reconciliation-report.${exportFormat}`
    );
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

export default useBankReconciliationReport;
